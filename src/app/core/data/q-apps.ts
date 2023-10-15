import gql from 'graphql-tag';

export const qAppsFull = gql`
  query allApps {
    allAdmAppsList {
      idAdmApp
      appPreferences
      title
      description
      helpView
      helpSummary
      helpScore
      helpCalibrate
      helpFacilitate
      frameworks: admFrameworksByIdAdmAppList(condition: { isActive: true }) {
        idAdmApp
        idAdmFramework
        idAdmScale
        frameworkName
        frameworkVersion
        effectiveDate
        endDate
        tags
        isActive
        rubrics: admRubricsByIdAdmFrameworkList {
          idAdmRubric
          rubricName
          rubricDescription
          idAdmFramework
          tags
        }
        scale: admScaleByIdAdmScale {
          idAdmScale
          scaleName
          scaleDescription
          displayOrder
          scaleGraphicUrl
          scores: admScoresByIdAdmScaleList {
            idAdmScore
            idAdmScale
            scoreName
            scoreValue
            displayOrder
            consistency
            frequency
            ownership
            quality
            intentionality
          }
        }
      }
      periods: admPeriodsByIdAdmAppList {
        idAdmApp
        idAdmPeriod
        periodName
        periodTag
        periodStartMonth
        periodEndMonth
        startsNewSequence
        idAdmStrType
        sCreate
        sCreateUser
        sUpdate
        sUpdateUser
      }
      seasons: vwSeasonsByIdAdmAppList(orderBy: STR_SEASON_DESC) {
        idAdmApp
        strSeason
      }
      relationships: refRelationsByIdAdmAppList {
        idRelation
        idAdmApp
        relationshipName
        relationshipDescription
        sCreate
        sCreateUser
        sUpdate
        sUpdateUser
      }
      templates: admTemplatesByIdAdmAppList {
        idAdmApp
        idTemplate
        tags
        templateDescription
        templateLink
        templateName
        templateText
        sortOrder
      }
      strTypes: admStrTypesByIdAdmAppList(orderBy: SORT_ORDER_ASC) {
        idAdmStrType
        idAdmApp
        idAdmFramework
        isCalibrated
        isOfficialRecord
        nextStrType
        prevStrType
        typeName
        typeTag
        typeDescription
        typeIcon
        initialIdRelation
        contributeToStrType
        viewAction
        editAction
        summaryAction
        printAction
        hasPeriod
        hasSummary
        hasSchool
        hasGoals
        helpView
        helpScore
        helpFacilitate
        helpSummary
        requireBaseline
        sCreate
        sCreateUser
        sUpdate
        sUpdateUser
        docCategories
        relationMaps: admStrTypeMapsByIdAdmStrTypeList( orderBy: DISPLAY_ORDER_ASC ) {
          idAdmStrTypeMap
          idAdmApp
          idAdmStrType
          idRelation
          nextIdRelation
          relationStrTypeId
          displayOrder
        }
        docSuggests: admDocSuggestsByIdAdmStrTypeList(orderBy: SORT_ORDER_ASC) {
          idAdmDocSuggest
          idAdmApp
          docTitle
          docNotes
          docCategories
        }
        defaultTemplates: vwDefaultTemplatesByIdAdmStrTypeList( orderBy: SORT_ORDER_ASC ) {
          idAdmDomain
          idAdmNarrative
          idAdmStrType
          narrativeName
          narrativeTags
          tags
          templateDescription
          templateLink
          templateName
          templateText
          sortOrder
        }
      }
    }
  }
`;

export const qAdmAppList = gql`
  query allApps {
    allAdmAppsList {
      idAdmApp
      title
      description
      sCreate
      sCreateUser
      sUpdateUser
      sUpdate
      appPreferences
      helpScore
      helpView
      helpSummary
      helpCalibrate
      helpFacilitate
    }
}`;