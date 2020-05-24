import { Manager, colors } from '../manager'
import { VOXEL_SIZE } from './voxel'

// Highlight
export const highlight = new Entity()
highlight.addComponent(new PlaneShape())
highlight.addComponent(
  new Transform({
    position: new Vector3(0, 0, 0),
    scale: new Vector3(VOXEL_SIZE, VOXEL_SIZE, VOXEL_SIZE),
  })
)
highlight.getComponent(PlaneShape).withCollisions = false
highlight.getComponent(Transform).scale.setAll(0)
engine.addEntity(highlight)

// Highlight material
export const highlightMaterial = new Material()
highlightMaterial.albedoColor = colors[Manager.colorIndex]
highlightMaterial.roughness = 1.0
highlight.addComponent(highlightMaterial)

export let highlightedVoxelID: string

// System that casts the rays to generate highlight
class HighlighterSystem implements ISystem {
  update(dt: number) {
    // Ray from camera
    const rayFromCamera: Ray = PhysicsCast.instance.getRayFromCamera(1000)

    // For the camera ray, we cast a hit all
    PhysicsCast.instance.hitFirst(rayFromCamera, (raycastHitEntity) => {
      if (raycastHitEntity.didHit) {
        // Check entity exists i.e. not been deleted
        if (engine.entities[raycastHitEntity.entity.entityId]) {
          // Highlight
          if (raycastHitEntity.entity.meshName != 'base_collider') {
            highlightedVoxelID = raycastHitEntity.entity.entityId
            highlightFace(engine.entities[highlightedVoxelID], raycastHitEntity)
          } else {
            highlightBase(raycastHitEntity)
            highlightedVoxelID = null
          }
        }
      } else {
        highlight.getComponent(Transform).scale.setAll(0)
        highlightedVoxelID = null
      }
    })
  }
}

// Adds systems to the engine
engine.addSystem(new HighlighterSystem())

let fixedRayEntity = new Entity()
fixedRayEntity.addComponent(
  new Transform({
    position: new Vector3(0, 0, 0),
  })
)
engine.addEntity(fixedRayEntity)

// Snaps the highlight plane to discrete points on or halfway between the grid lines
function highlightBase(raycastHitEntity: RaycastHitEntity) {
  highlight.getComponent(Transform).rotation = Quaternion.Euler(90, 0, 0)
  let x: number = Math.round(raycastHitEntity.hitPoint.x * 8) / 8
  let z: number = Math.round(raycastHitEntity.hitPoint.z * 8) / 8
  highlight.getComponent(Transform).position.set(x, 0.11, z)
  highlight.getComponent(Transform).scale.setAll(VOXEL_SIZE)
}

function highlightFace(entity: IEntity, raycastHitEntity: RaycastHitEntity) {
  let transform = entity.getComponent(Transform).position.clone() // Clone position of the voxel
  highlight.getComponent(Transform).position = transform // Set highlight transform to match the voxel
  highlight.getComponent(Transform).scale.setAll(VOXEL_SIZE)
  let highlightRotation = highlight.getComponent(Transform).rotation
  if (raycastHitEntity.hitNormal.x != 0) {
    highlightRotation = Quaternion.Euler(0, 90, 0)
    raycastHitEntity.hitNormal.x > 0
      ? (highlight.getComponent(Transform).position.x =
          transform.x + VOXEL_SIZE / 1.99) // Offset from voxel center with slight offset
      : (highlight.getComponent(Transform).position.x =
          transform.x - VOXEL_SIZE / 1.99)
  }
  if (raycastHitEntity.hitNormal.y != 0) {
    highlightRotation = Quaternion.Euler(90, 0, 0)
    raycastHitEntity.hitNormal.y > 0
      ? (highlight.getComponent(Transform).position.y =
          transform.y + VOXEL_SIZE / 1.99)
      : (highlight.getComponent(Transform).position.y =
          transform.y - VOXEL_SIZE / 1.99)
  }
  if (raycastHitEntity.hitNormal.z != 0) {
    highlightRotation = Quaternion.Euler(0, 0, 90)
    raycastHitEntity.hitNormal.z > 0
      ? (highlight.getComponent(Transform).position.z =
          transform.z + VOXEL_SIZE / 1.99)
      : (highlight.getComponent(Transform).position.z =
          transform.z - VOXEL_SIZE / 1.99)
  }
  highlight.getComponent(Transform).rotation = highlightRotation
}
