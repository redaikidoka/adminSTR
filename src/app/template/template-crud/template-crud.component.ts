import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

import {switchMap, tap, map} from 'rxjs/operators';
import {Observable, of} from 'rxjs';

import {AuthService} from '../../core/auth.service';
import {TemplateService} from '../../core/template.service';
import {LoggerService} from '../../core/logger.service';

import {AdmApp, AdmTemplate} from '../../core/data/adm-app';
import {VwUser} from '../../core/data/vw-user';

import {UnsubscribeOnDestroyAdapter} from '../../core/unsubscribe-on-destroy-adapter';

import {MatSnackBar} from '@angular/material/snack-bar';
import {MatSelectChange} from '@angular/material/select';
import {SystemService} from '../../core/system.service';
import {FormStatus} from '../../core/core.module';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-template-crud',
  templateUrl: './template-crud.component.html',
  styleUrls: ['./template-crud.component.scss'],
})
export class TemplateCrudComponent extends UnsubscribeOnDestroyAdapter implements OnInit {

  selectedTemplate: AdmTemplate = {} as AdmTemplate;
  templateList$: Observable<AdmTemplate[]> = this.getTemplateList$();;

  status: FormStatus = 'Empty';
  listStyle: string = 'Dropdown';

  templateFormGroup: FormGroup;

  selectedApp: AdmApp = {} as AdmApp;
  appList$: Observable<AdmApp[]> = this.system.getApps();

  idImportedApp: number = 0;

  constructor(
    private auth: AuthService,
    private system: SystemService,
    private formBuilder: FormBuilder,
    private snack: MatSnackBar,
    private templateService: TemplateService,
    private logger: LoggerService,
    private aRoute: ActivatedRoute,
  ) {
    super();


    this.templateFormGroup = this.formBuilder.group({
      templateName: ['', Validators.required],
      templateDescription: [''],
      templateText: ['', Validators.required],
      templateLink: [''],
      tags: ['', Validators.required],
      sortOrder: ['10', Validators.required],
    });


    // get our id
    this.subs.sink = this.aRoute.params.subscribe(param => {
      if (param['idAdmApp']) {
        console.log('TemplateCRUD::params', param['idAdmApp']);

        this.idImportedApp = param['idAdmApp'];
        this.subs.sink = this.system.getApp(this.idImportedApp).subscribe(app => {
          console.log('We were passed this app', this.idImportedApp, app);
          this.selectedApp = app;
          this.loadTemplates();
        });

      }
    });
  }

  ngOnInit(): void {

    this.setForm();
  }

  hasApp(): boolean {
    return (this.selectedApp?.idAdmApp > 0);
  }

  getTemplateList$(): Observable<AdmTemplate[]> {
    if (this.selectedApp?.idAdmApp > 0) {
      console.log('TemplateCRUD::getTemplateList$ we have an app selected', this.selectedApp);

      // we have an app set, let's load
      return this.templateService.loadTemplates$(this.selectedApp.idAdmApp).pipe(
        tap(templateList => {
          console.log('TemplateCrud::loadTemplate$', templateList);
        }, err => {
          this.logger.logErrObject('TemplateCrud::getTemplateList$', err, 'Could not load Template List');
        })
      );
    }

    console.log('TemplateCRUD::getTemplateList$ we have no app selected');
    return this.auth.getCurrentApp$().pipe(
      switchMap(testApp => {
        if (testApp && testApp.idAdmApp) {
          return this.templateService.loadTemplates$(testApp.idAdmApp);
        } else {
          console.log('TemplateCrud::getTemplateList$ - no app');
          return of([]);
        }
      }),
      tap(testApp => {
        console.log('TemplateCrud::testApp', testApp);
      }, err => {
        this.logger.logErrObject('TemplateCrud::getTemplateList$', err, 'Could not load Template List');
      })
    );
  }

  loadTemplates(): void {
    this.templateList$ = this.getTemplateList$();
  }

  setForm(): void {
    console.log('TemplateCrud::setForm:', this.selectedTemplate);

    if (this.selectedTemplate && this.selectedTemplate?.idTemplate > 0) {
      this.templateFormGroup = this.formBuilder.group({
        templateName: [this.selectedTemplate.templateName, Validators.required],
        templateDescription: [this.selectedTemplate.templateDescription],
        templateText: [this.selectedTemplate.templateText, Validators.required],
        templateLink: [this.selectedTemplate.templateLink],
        tags: [this.selectedTemplate.tags],
        sortOrder: [this.selectedTemplate.sortOrder],
      });
    } else {
      this.templateFormGroup = this.formBuilder.group({
        templateName: ['', Validators.required],
        templateDescription: [''],
        templateText: ['', Validators.required],
        templateLink: [''],
        tags: [''],
        sortOrder: ['10'],
      });
    }

    console.log('TemplateCrud::setForm ', this.templateFormGroup);
  }

  templateSelected(event: MatSelectChange) {
    console.log('TemplateCrud::templateSelected', event);
    this.status = 'Editing';
    this.selectedTemplate = event.value;

    this.setForm();
  }

  selectTemplate(t: AdmTemplate): void {
    console.log('TemplateCrud::templateSelected', t);
    this.status = 'Editing';
    this.selectedTemplate = t;

    this.setForm();
  }

  createTemplate() {
    this.status = 'Creating';
    this.selectedTemplate = <AdmTemplate>{
      idAdmApp: this.selectedApp.idAdmApp,
      idTemplate: 0,

      templateName: '',
      templateDescription: '',
      templateText: '',
      sortOrder: 10,
      sCreateUser: this.auth.myId(),
      sUpdateUser: null
    };

    this.setForm();
  }

  deleteTemplate(): void {
    if (this.status === 'Creating') {
      this.selectedTemplate = {} as AdmTemplate;
      this.status = 'Empty';
      return;
    }

    if (!window.confirm('Are you sure you want to delete ' + this.selectedTemplate.templateName + '?')) {
      return;
    }

    this.subs.sink = this.templateService.deleteTemplate(this.selectedTemplate.idTemplate, this.auth.myId()).subscribe(
      result => {
        console.log('TemplateCrud::deleteTemplate results', result);
        this.loadTemplates();
        this.selectedTemplate = {} as AdmTemplate;
        this.status = 'Empty';
      },
      err => this.logger.logErrObject('TemplateCrud::deleteTemplate', err, 'Could not delete Template')
    );

  }

  updateTemplate() {

    if (this.templateFormGroup.invalid) {
      window.alert('Please fill in all the required fields!');
      return;
    }

    console.assert(this.selectedTemplate?.idAdmApp > 0, 'We need to have an app id');
    if (!this.selectedTemplate) {
      console.error('TemplateCrud::updateTemplate : Could not save - no template!');
      return;
    }

    this.selectedTemplate = {
      ...this.selectedTemplate,
      ...this.templateFormGroup.value,
    };
    console.log('TemplateCrud::updateTemplate saving', this.selectedTemplate);

    // TODO: createTemplate should update the TemplateList()
    if (this.status === 'Creating') {
      this.subs.sink = this.templateService
        .createTemplate(this.selectedTemplate)
        .subscribe((id) => {
          this.selectedTemplate.idTemplate = id;
          this.status = 'Editing';
          this.loadTemplates();
          this.snack.open('Created the Template', '', {duration: 2000});
        });
    } else {
      console.log('TemplateCrud::updateTemplate Saving');

      this.subs.sink = this.templateService
        .updateTemplate(this.selectedTemplate)
        .subscribe((res) => {
          console.log('TemplateCrud::updateTemplate - saved', res);
          // this.subs.sink = this.templateService.loadTemplates$(this.app.idAdmApp).subscribe((templates) => (this.app.templates = templates));
          this.loadTemplates();
          this.snack.open('Saved the Template', '', {duration: 2000});
        });
    }
  }

  appSelected($event: any): void {

    console.log('TemplateCrud::appSelected', $event);

    this.selectedApp = $event?.value;
    this.loadTemplates();

  }
}
