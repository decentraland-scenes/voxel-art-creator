const functions = require('firebase-functions')
const express = require('express')
const cors = require('cors')
const app = express()
app.use(cors({ origin: true }))

export enum Mode {
  Add = 0,
  Subtract = 1,
  EyeDrop = 2,
}

export type VoxelData = {
  x: number
  y: number
  z: number
  colIndex: number
  mode: Mode
}

app.get('/hello-world', (req: any, res: any) => {
  return res.status(200).send('Hello World!')
})

app.get('/voxels', async (req: any, res: any) => {
  let realm = req.query.realm
  let url =
    'https://soho-plaza.s3.us-east-2.amazonaws.com/voxels' +
    realm +
    '/voxels.json'

  let currentVoxels: VoxelData[] = await getVoxelJSON(url)

  return res.status(200).json({ tiles: currentVoxels })
})

app.post('/update-voxels', async (req: any, res: any) => {
  let realm = req.query.realm
  let voxels = req.body.voxels

  updateVoxelJSON(voxels, realm)

  return res.status(200).send('Updated Voxels')
})

app.post('/reset-voxels', async (req: any, res: any) => {
  let realm = req.query.realm
  let tiles: VoxelData[] = []

  updateVoxelJSON(tiles, realm)

  return res.status(200).send('Updated Voxels')
})

//// AWS
const AWS = require('aws-sdk')

const AWSconfig = require('../keys/aws-key.json')

// You will need your own amazon key to handle this authentication step
AWS.config.setPromisesDependency()
AWS.config.update({
  accessKeyId: AWSconfig.AWSAccessKeyId,
  secretAccessKey: AWSconfig.AWSSecretKey,
  region: 'us-east-2',
})

export async function updateVoxelJSON(tiles: VoxelData[], realm: string) {
  var upload = new AWS.S3.ManagedUpload({
    params: {
      Bucket: 'soho-plaza',
      Key: 'voxels/' + realm + '/voxels.json',
      Body: JSON.stringify({ tiles: tiles }),
      ACL: 'public-read',
      ContentType: 'application/json; charset=utf-8',
    },
  })

  var promise = upload.promise()

  promise.then(
    function (data: any) {
      console.log('Successfully uploaded voxel JSON')
    },
    function (err: any) {
      console.log('There was an error uploading voxel json file: ', err.message)
    }
  )
}

export async function getVoxelJSON(url: string): Promise<VoxelData[]> {
  try {
    let response = await fetch(url).then()
    let json = await response.json()
    return json.tiles
  } catch {
    console.log('error fetching from AWS server')
    console.log('url used: ', url)
    return []
  }
}

exports.app = functions.https.onRequest(app)
