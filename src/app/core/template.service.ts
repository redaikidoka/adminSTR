import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import gql from 'graphql-tag';
import { Apollo } from 'apollo-angular';

import { UnsubscribeOnDestroyAdapter } from './unsubscribe-on-destroy-adapter';

import { LoggerService } from './logger.service';
import { AuthService } from './auth.service';
import { AdmTemplate } from './data/adm-app';

@Injectable({
  providedIn: 'root',
})
export class TemplateService extends UnsubscribeOnDestroyAdapter {
  idApp: number | undefined;

  static dataToGQ(data: object): string {
    const dataCopy = { ...data };
    // @ts-ignore
    if (dataCopy['idTemplate']) {
      // @ts-ignore
      delete dataCopy['idTemplate'];
    }

    return JSON.stringify(data).replace(/\"([^(\")"]+)\":/g, '$1:');
  }

  constructor(
    private logger: LoggerService,
    private auth: AuthService,
    private apollo: Apollo
  ) {
    super();
  }

  createTemplate(template: AdmTemplate): Observable<number> {
    const qCreate = gql` mutation MyMutation {
        createAdmTemplate(input: {admTemplate: {
            idAdmApp: ${template.idAdmApp}
            templateName: """${template.templateName}"""
            templateText: """${template.templateText}"""
            templateDescription: """${
              template.templateDescription ? template.templateDescription : ''
            }"""
            sortOrder: ${template.sortOrder}
            tags: """${template.tags ? template.tags : ''}"""
            templateLink: """${
              template.templateLink ? template.templateLink : ''
            }"""
            sCreateUser: ${template.sCreateUser}
          }
        })
        { admTemplate { idAdmApp idTemplate } }
      } `;

    console.log('AdminService::createTemplate executing', qCreate, template);

    return this.apollo
      .mutate<any>({ mutation: qCreate, refetchQueries: ['allAdmApps', 'allAdmTemplatesList'] })
      .pipe(
        tap(
          (res) => console.log('AdminService::createTemplate return info', res),
          (err) =>
            this.logger.logErrObject(
              'AdminService::createTemplate',
              err,
              'Could not create template :('
            )
        ),

        map(
          (response) => response.data.createAdmTemplate.admTemplate.idTemplate
        )
      );
  }

  updateTemplate(template: AdmTemplate): Observable<any> {
    const qUpdate = gql`
      mutation MyMutation {
        __typename
        updateAdmTemplateByIdTemplate(input: {admTemplatePatch: {
            sortOrder: ${template.sortOrder} ,
            tags: """${template.tags ? template.tags : ''}""",
            templateDescription: """${
              template.templateDescription ? template.templateDescription : ''
            }""",
            templateLink: """${
              template.templateLink ? template.templateLink : ''
            }""",
            templateName: """${template.templateName}""",
            templateText: """${template.templateText}"""
            sUpdateUser: ${template.sUpdateUser}
            }
          idTemplate: ${template.idTemplate} } )
        {  clientMutationId }
      } `;

    console.log('AdminService::updateTemplate executing', qUpdate, template);
    this.idApp = template.idAdmApp;
    return this.apollo
      .mutate<any>({
        mutation: qUpdate,
        refetchQueries: ['allAdmApps', 'allAdmTemplatesList'],
      })
      .pipe(
        tap(
          (res) => console.log('AdminService::updateTemplate return info', res),
          (err) =>
            this.logger.logErrObject(
              'AdminService::updateTemplate',
              err,
              'Could not update template :('
            )
        )
      );
  }

  deleteTemplate(idTemplate: number, idUser: number): Observable<any> {
    // TODO: touch record, log deletion, then delete
    const qDelete = gql`mutation deleteTemplate {
      updateAdmTemplateByIdTemplate(
        input: { admTemplatePatch: { sUpdateUser: ${idUser} }, idTemplate: ${idTemplate} }
      ) {
        clientMutationId
      }

      createSActivity(
        input: {
          sActivity: {
            isComplete: true
            linkedId: ${idTemplate}
            linkedObject: 501
            note: "deleting template ${idTemplate} by ${idUser}"
          }
        }
      ) {
        clientMutationId
      }


      deleteAdmTemplateByIdTemplate(input: {idTemplate: ${idTemplate} }) {
        deletedAdmTemplateId
        }
      }`;

    console.log('adminService::deleteTemplate', qDelete, idTemplate);

    return this.apollo
      .mutate<any>({
        mutation: qDelete,
        refetchQueries: ['allAdmApps', 'allAdmTemplatesList'],
      })
      .pipe(
        tap((delResult) => {
          console.log('adminService::deleteTemplate return info', delResult);
        })
      );
  }

  loadTemplates$(idApp: number): Observable<AdmTemplate[]> {
    const qFetchTemplates = gql`query FetchTemplates {
      allAdmTemplatesList (condition: {idAdmApp: ${idApp}  }) {
          idAdmApp
          idTemplate
          sCreate
          sCreateUser
          sUpdate
          sUpdateUser
          sortOrder
          tags
          templateDescription
          templateLink
          templateName
          templateText
      }
    }
    `;

    console.log(
      'AdminService::loadTemplates executing',
      qFetchTemplates,
      idApp
    );

    return this.apollo
      .query<any>({ query: qFetchTemplates, fetchPolicy: 'network-only' })
      .pipe(
        tap((res) => {
          console.log('AdminService::loadTemplates - loaded', res);
        }),
        map((results) => results.data.allAdmTemplatesList)
      );
  }
}
