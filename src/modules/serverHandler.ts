import { voxelData, VoxelData } from './voxel'
import { setRealm, playerRealm } from './realmData'
import * as utils from '@dcl/ecs-scene-utils'

export const awsServer = 'https://soho-plaza.s3.us-east-2.amazonaws.com/'
export const fireBaseServer =
  'https://us-central1-soho-plaza.cloudfunctions.net/app/'

// get lastest mural state
export async function getVoxels(): Promise<VoxelData[]> {
  try {
    if (!playerRealm) {
      await setRealm()
    }
    const url = awsServer + 'voxels/' + playerRealm + '/voxels.json'
    const response = await fetch(url).then()
    const json = await response.json()
    return json.tiles
  } catch {
    log('error fetching from AWS server')
  }
}

// update mural
export async function changeVoxels() {
  if (!playerRealm) {
    await setRealm()
  }
  voxelChanger.addComponentOrReplace(
    // Only send request if no more changes come over the next second
    new utils.Delay(1000, async function () {
      try {
        const url = fireBaseServer + 'update-voxels?realm=' + playerRealm
        const body = JSON.stringify({ voxels: voxelData })
        const headers = {}
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: body
        })
        return response.json()
      } catch {
        log('error fetching from AWS server')
      }
    })
  )
}

// dummy entity to throttle the sending of change requests
export const voxelChanger = new Entity()
engine.addEntity(voxelChanger)
