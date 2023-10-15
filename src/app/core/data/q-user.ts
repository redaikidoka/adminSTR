import gql from 'graphql-tag';

export const usrFields = `idAdmUser
        idAdmApp
        idManager
        idUserType
        imageLink
        imageUrl
        isActive
        tags
        userEmail
        userName
        userScore
        userTypeNotes
        userTypeTitle
        userPreferences`;

export const qVwUserAll = gql`{
  allVwUsersList(orderBy: USER_NAME_ASC) {
      ${usrFields}
  } }`;


export const qVwUserActive = gql`
  {
    allVwUsersList(condition: {isActive: true} , orderBy: USER_NAME_ASC) {
        ${usrFields}
    }
  } `;


