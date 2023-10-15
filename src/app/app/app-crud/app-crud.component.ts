import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormGroupDirective, ValidationErrors, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/core/auth.service';
import { AdmApp } from 'src/app/core/data/adm-app';
import { LoggerService } from 'src/app/core/logger.service';
import { SystemService } from 'src/app/core/system.service';
import {Observable} from 'rxjs';
import { UnsubscribeOnDestroyAdapter } from 'src/app/core/unsubscribe-on-destroy-adapter';
import { ActivatedRoute } from '@angular/router';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-app-crud',
  templateUrl: './app-crud.component.html',
  styleUrls: ['./app-crud.component.scss']
})
export class AppCrudComponent extends UnsubscribeOnDestroyAdapter implements OnInit {

  admApp: AdmApp = {} as AdmApp;
  appList$: Observable<AdmApp[]>;
  appFormGroup!: FormGroup;
  isLoading: boolean = false;
  isCreate: boolean = true;
  urlRegex = /(^|\s)((https?:\/\/)?[\w-]+(\.[\w-]+)+\.?(:\d+)?(\/\S*)?)/gi;

  constructor(
    private auth: AuthService,
    private systemService: SystemService,
    private formBuilder: FormBuilder,
    private snack: MatSnackBar,
    private logger: LoggerService,
    private aRoute: ActivatedRoute
  ) {
    super();
    this.appList$ = this.systemService.loadApps$();
  }

  ngOnInit(): void {
    this.setAdmForm();
    this.subs.sink = this.aRoute.queryParams.subscribe(param => {
      if (param['id']) {
        console.log('AppCRUD::params', Number(param['id']));
        const appId = Number(param['id']);
        this.subs.sink = this.systemService.getApp(appId).subscribe(app => {
          this.admApp = app;
          this.editApp(app);
        });
      }
    });
  }

  setAdmForm() {
    this.appFormGroup = this.formBuilder.group({
      title: [this.admApp.title, Validators.required],
      description: [this.admApp.description],
      appPreferences: [this.admApp.appPreferences, [Validators.required, this.jsonValidator]],
      helpScore: [this.admApp.helpScore, Validators.pattern(this.urlRegex)],
      helpView: [this.admApp.helpView, Validators.pattern(this.urlRegex)],
      helpSummary: [this.admApp.helpSummary, Validators.pattern(this.urlRegex)],
      helpCalibrate: [this.admApp.helpCalibrate, Validators.pattern(this.urlRegex)],
      helpFacilitate: [this.admApp.helpFacilitate, Validators.pattern(this.urlRegex)],
    });
  }

  // loadAppList(){
  //   this.appList$ = this.systemService.loadApps$();
  // }

  jsonValidator(control: AbstractControl): ValidationErrors | null {
    try {
      JSON.parse(control.value);
    } catch (e) {
      return { jsonInvalid: true };
    }
    return null;
  };

  get appPreferences() {
    return this.appFormGroup.get('appPreferences');
  }

  newApp(ngAppFormGroup: FormGroupDirective) {
    ngAppFormGroup.resetForm();
    this.appFormGroup.reset();
    this.isCreate = true;
  }

  editApp(app: AdmApp) {
    this.admApp = app;
    this.isCreate = false;
    this.setAdmForm();
  }

  deleteApp(ngAppFormGroup: FormGroupDirective, app?: AdmApp): void {
    const appId = app ? app.idAdmApp : this.admApp.idAdmApp;
    const appTitle = app ? app.title : this.admApp.title;
    if (!window.confirm('Are you sure you want to delete ' + appTitle + ' app ?')) {
      return;
    }
    this.isLoading = true;
    this.subs.sink = this.systemService.deleteApp(appId, this.auth.myId()).subscribe(
      result => {
        this.isLoading = false;
        // console.log('AppCRUD::deleteApp results', result);
      }, err => {
        this.isLoading = false;
        this.logger.logErrObject('AppCRUD::deleteApp', err, 'Could not delete App');
      }
    );
    this.newApp(ngAppFormGroup);
  }

  saveApp(ngAppFormGroup: FormGroupDirective) {
    this.appFormGroup.markAsTouched();
    if(this.appFormGroup.valid) {
      this.isLoading = true;
      const app = {...this.appFormGroup.value} as AdmApp;
      app.appPreferences = JSON.stringify(JSON.parse(this.appPreferences?.value));
      if(this.isCreate) {
        app.sCreateUser =  this.auth.myId();
        this.subs.sink = this.systemService
          .createApp(app)
          .subscribe((_) => {
            // this.newApp(ngAppFormGroup);
            this.isLoading = false;
            this.snack.open('App created successfully', '', {duration: 2000});
          }, err => {
            this.isLoading = false;
            this.logger.logErrObject('AppCRUD::createApp', err, 'Could not create App');
          });
      } else {
        app.sUpdateUser =  this.auth.myId();
        app.idAdmApp = this.admApp.idAdmApp;
        this.subs.sink = this.systemService
          .updateApp(app)
          .subscribe((_) => {
            // this.newApp(ngAppFormGroup);
            this.isLoading = false;
            this.snack.open('App updated successfully', '', {duration: 2000});
          }, err => {
            this.isLoading = false;
            this.logger.logErrObject('AppCRUD::updateApp', err, 'Could not update App');
          });
      }
    }
  }

}
