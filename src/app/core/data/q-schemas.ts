import gql from 'graphql-tag';


export const qSchema = gql` query DBVersion  {
  allVwSchemasList {
    version
    checksum
    description
    installedBy
    executionTime
    installedOn
    installedRank
    script
    success
    type
    __typename
  } }`;
