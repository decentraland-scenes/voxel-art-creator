import { Manager, materials } from '../manager'
import { Voxel, VOXEL_SIZE } from './voxel'
import { highlight } from './highliter'
import resources from '../resources'

// Adds a voxel to the scene
const voxelShape = new BoxShape()

function addBaseVoxel(x: number, y: number, z: number) {
  log('Voxel added')
  Manager.playAddVoxelSound()

  const voxel = new Voxel(
    voxelShape,
    new Transform({
      position: new Vector3(x, y, z),
      scale: new Vector3(VOXEL_SIZE, VOXEL_SIZE, VOXEL_SIZE),
    })
  )
  voxel.addComponent(materials[Manager.colorIndex])
}

// Base grid
const baseGrid = new Entity()
baseGrid.addComponent(resources.models.baseGrid)
baseGrid.addComponent(
  new Transform({
    position: new Vector3(0, 0, 0),
  })
)
baseGrid.addComponent(
  new OnPointerDown(
    (e) => {
      let transform = highlight.getComponent(Transform).position
      addBaseVoxel(transform.x, VOXEL_SIZE / 2 + 0.1, transform.z) // Base grid height is 0.1
    },
    {
      button: ActionButton.POINTER,
      showFeedback: false,
    }
  )
)
engine.addEntity(baseGrid)