export interface AdmApp {
  idAdmApp: number;
  appPreferences: string;
  description: string;
  title: string;

  helpView?: string;
  helpSummary?: string;
  helpScore?: string;
  helpCalibrate?: string;
  helpFacilitate?: string;

  sCreate: Date;
  sCreateUser?: any;
  sUpdate: Date;
  sUpdateUser?: any;

  frameworks?: AdmFramework[];
  periods?: AdmPeriod[];
  relationships?: RefRelation[];
  strTypes?: AdmStrType[];
  seasons?: VwReviewSeason[];
  templates?: AdmTemplate[];

  // admFrameworksByIdAdmAppList: [];
  // admPeriodsByIdAdmAppList: [];
  // refRelationsByIdAdmAppList: [];
  // vwSeasonsByIdAdmAppList: [];
  // admTemplatesByIdAdmAppList: [];
  // admStrTypesByIdAdmAppList: [];
}

// a set of practices and their organizing capacities and domains that defines a review
// often a framework will evolve over time
export interface AdmFramework {
  idAdmApp: number;
  idAdmFramework: number;
  frameworkName: string;
  frameworkVersion: number;
  effectiveDate: Date;
  endDate?: any;
  isActive?: boolean;
  tags?: string;
  idAdmScale?: number;

  sCreate: Date;
  sCreateUser?: any;
  sUpdate: Date;
  sUpdateUser?: any;

  // internal objects not loaded form the database.
  scale?: AdmScale;
  rubrics?: AdmRubric[];
}

// A scale of scores for a Framework
export interface AdmScale {
  idAdmScale: number;
  scaleName: string;
  scaleDescription: string;
  displayOrder: number;
  scaleGraphicUrl: string;

  scores?: AdmScore[];
  // admScoresByIdAdmScaleList: AdmScore[];
  // __typename: string;
}

// a score for a scale
export interface AdmScore {
  idAdmScore: number;
  idAdmScale: number;

  scoreName: string;
  scoreValue: number;

  displayOrder: number;

  consistency?: string;
  frequency?: string;
  ownership?: string;
  quality?: string;
  intentionality?: string;
  // __typename: string;
}

// Rubric is a subset of a Framework for a specific use, such as Leadership Rescore
export interface AdmRubric {
  rubricName: string;
  rubricDescription: string;
  idAdmFramework: number;
  idAdmRubric: number;
  nodeId: string;
  sCreate: Date;
  sCreateUser?: any;
  sUpdate: Date;
  sUpdateUser?: any;
  tags?: any;
}

// export interface AdmRubricsByIdAdmFramework {
//   nodes: Node3[];
// }

export interface AdmPeriod {
  idAdmApp: number;
  idAdmPeriod: number;
  nodeId: string;
  periodEndMonth: number;
  periodName: string;
  periodStartMonth: number;
  periodTag?: any;
  startsNewSequence: boolean;
  idAdmStrType: number;

  sCreate: Date;
  sCreateUser?: any;
  sUpdate: Date;
  sUpdateUser?: any;
}

export interface RefRelation {
  idRelation: number;
  idAdmApp: number;
  nodeId: string;
  relationshipName: string;
  relationshipDescription?: string;

  sCreate: Date;
  sCreateUser: number;
  sUpdate: Date;
  sUpdateUser?: any;
}

export interface AdmStrType {
  idAdmStrType: number;
  idAdmFramework: number;
  idAdmApp: number;

  sortOrder: number;

  isOfficialRecord: boolean;
  isCalibrated: boolean;

  nextStrType: number;
  prevStrType: number;

  typeName: string;
  typeTag: string;
  typeDescription: string;
  typeIcon: string;

  initialIdRelation?: number;
  contributeToStrType?: number;

  editAction?: string;
  viewAction?: string;
  summaryAction?: string;
  printAction?: string;

  hasPeriod: boolean;
  hasSummary: boolean;
  hasSchool: boolean;
  hasGoals: boolean;

  helpView: string;
  helpScore: string;
  helpFacilitate: string;
  helpSummary: string;

  requireBaseline?: boolean;

  sCreate: Date;
  sCreateUser?: any;
  sUpdate: Date;
  sUpdateUser?: any;

  relationMaps?: AdmStrTypeMap[];
  docCategories?: AdmDocCategory[];
  defaultTemplates?: VwDefaultTemplate[];
}

export interface AdmStrTypeMap {
  idAdmStrTypeMap: number;
  idAdmStrType: number;

  idAdmApp: number;
  idRelation: number;

  nextIdRelation?: number;
  relationStrTypeId?: number;
  displayOrder?: number;

  sCreate: Date;
  sCreateUser?: any;
  sUpdate: Date;
  sUpdateUser?: any;
}

export interface VwReviewSeason {
  idAdmApp: number;
  strSeason: string;
}

export interface AdmTemplate {
  idAdmApp: number;
  idTemplate: number;

  templateName: string;
  templateText: string;
  tags?: string;
  templateDescription?: string;
  templateLink?: string;
  sortOrder?: number;

  sCreate?: string;
  sCreateUser?: any;
  sUpdate?: string;
  sUpdateUser?: any;
}

// PS 2020-07-28 16:23:10 : Added to support Documents
export interface AdmDocCategory {
  idAdmDocCategory: number;
  idAdmApp: number;
  idAdmStrType: number;

  docCategoryName: string;

  docSuggests?: AdmDocSuggests[];
}

export interface AdmDocSuggests {
  idAdmDocSuggest: number;

  idAdmDocCategory: number;
  idAdmApp: number;

  docTitle: string;
  docNotes?: string;
}

export interface VwDefaultTemplate {
  // VwDefaultTemplatesByIDAdmStrTypeList {
  idAdmDomain: number;
  idAdmNarrative: number;
  idAdmStrType: number;
  narrativeName: string;
  narrativeTags: string;
  tags: string;
  templateDescription: string;
  templateLink: string;
  templateName: string;
  templateText: string;
  sortOrder: number;
}
