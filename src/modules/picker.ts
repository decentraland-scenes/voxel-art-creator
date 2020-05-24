import { Manager, colors } from '../manager'
import { VOXEL_SIZE } from './voxel'

// Picker
export const picker = new Entity()
picker.addComponent(new PlaneShape())
picker.addComponent(
  new Transform({
    position: new Vector3(0, 0, 0),
    scale: new Vector3(VOXEL_SIZE, VOXEL_SIZE, VOXEL_SIZE),
  })
)
picker.getComponent(PlaneShape).withCollisions = false
picker.getComponent(Transform).scale.setAll(0)
engine.addEntity(picker)

// Material
export const pickerMaterial = new Material()
pickerMaterial.albedoColor = colors[Manager.colorIndex]
pickerMaterial.roughness = 1.0
picker.addComponent(pickerMaterial)

export let pickedVoxelID: string

// System that casts the rays to generate picker
class PickerSystem implements ISystem {
  update(dt: number) {
    // Ray from camera
    const rayFromCamera: Ray = PhysicsCast.instance.getRayFromCamera(1000)

    // For the camera ray, we cast a hit all
    PhysicsCast.instance.hitFirst(rayFromCamera, (raycastHitEntity) => {
      if (raycastHitEntity.didHit) {
        // Check entity exists i.e. not been deleted
        if (engine.entities[raycastHitEntity.entity.entityId]) {
          if (raycastHitEntity.entity.meshName != 'base_collider') {
            pickedVoxelID = raycastHitEntity.entity.entityId
            pickerFace(engine.entities[pickedVoxelID], raycastHitEntity)
          } else {
            pickerBase(raycastHitEntity)
            pickedVoxelID = null
          }
        }
      } else {
        picker.getComponent(Transform).scale.setAll(0)
        pickedVoxelID = null
      }
    })
  }
}

// Adds systems to the engine
engine.addSystem(new PickerSystem())

let fixedRayEntity = new Entity()
fixedRayEntity.addComponent(
  new Transform({
    position: new Vector3(0, 0, 0),
  })
)
engine.addEntity(fixedRayEntity)

// Snaps the picker plane to discrete points on or halfway between the grid lines
function pickerBase(raycastHitEntity: RaycastHitEntity) {
  picker.getComponent(Transform).rotation = Quaternion.Euler(90, 0, 0)
  let x: number = Math.round(raycastHitEntity.hitPoint.x * 8) / 8
  let z: number = Math.round(raycastHitEntity.hitPoint.z * 8) / 8
  picker.getComponent(Transform).position.set(x, 0.11, z)
  picker.getComponent(Transform).scale.setAll(VOXEL_SIZE)
}

function pickerFace(entity: IEntity, raycastHitEntity: RaycastHitEntity) {
  let transform = entity.getComponent(Transform).position.clone() // Clone position of the voxel
  picker.getComponent(Transform).position = transform // Set picker transform to match the voxel
  picker.getComponent(Transform).scale.setAll(VOXEL_SIZE)
  let pickerRotation = picker.getComponent(Transform).rotation
  if (raycastHitEntity.hitNormal.x != 0) {
    pickerRotation = Quaternion.Euler(0, 90, 0)
    raycastHitEntity.hitNormal.x > 0
      ? (picker.getComponent(Transform).position.x =
          transform.x + VOXEL_SIZE / 1.99) // Offset from voxel center with slight offset
      : (picker.getComponent(Transform).position.x =
          transform.x - VOXEL_SIZE / 1.99)
  }
  if (raycastHitEntity.hitNormal.y != 0) {
    pickerRotation = Quaternion.Euler(90, 0, 0)
    raycastHitEntity.hitNormal.y > 0
      ? (picker.getComponent(Transform).position.y =
          transform.y + VOXEL_SIZE / 1.99)
      : (picker.getComponent(Transform).position.y =
          transform.y - VOXEL_SIZE / 1.99)
  }
  if (raycastHitEntity.hitNormal.z != 0) {
    pickerRotation = Quaternion.Euler(0, 0, 90)
    raycastHitEntity.hitNormal.z > 0
      ? (picker.getComponent(Transform).position.z =
          transform.z + VOXEL_SIZE / 1.99)
      : (picker.getComponent(Transform).position.z =
          transform.z - VOXEL_SIZE / 1.99)
  }
  picker.getComponent(Transform).rotation = pickerRotation
}
