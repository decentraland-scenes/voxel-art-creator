import { getCurrentRealm } from '@decentraland/EnvironmentAPI'

// we're hardcoding the player's realm, bc it can't be fetched while the scene is being loaded. Needs to be triggered after that.
export let playerRealm = 'localhost-stub' //getRealm()

// fetch the player's realm
export async function setRealm() {
  let realm = await getCurrentRealm()
  log(`You are in the realm: ${JSON.stringify(realm.displayName)}`)
  playerRealm = realm.displayName
}

// fetch the player's realm
export async function getRealm() {
  let realm = await getCurrentRealm()
  log(`You are in the realm: ${JSON.stringify(realm.displayName)}`)
  return realm.displayName
}
