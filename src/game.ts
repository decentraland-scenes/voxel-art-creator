// TODO: THIS ALL NEEDS TIDYING UP
// Sounds
export const addVoxelSound = new Entity()
addVoxelSound.addComponent(new Transform())
addVoxelSound.getComponent(Transform).position = Camera.instance.position
addVoxelSound.addComponent(
  new AudioSource(new AudioClip('sounds/navigationForward.mp3'))
)
engine.addEntity(addVoxelSound)

export const removeVoxelSound = new Entity()
removeVoxelSound.addComponent(new Transform())
removeVoxelSound.getComponent(Transform).position = Camera.instance.position
removeVoxelSound.addComponent(
  new AudioSource(new AudioClip('sounds/navigationBackward.mp3'))
)
engine.addEntity(removeVoxelSound)

// Track color changes
let colorIndex = 0

// Colors to cycle through (7 main colours + white + black)
const colors: Color3[] = [
  Color3.FromInts(255, 255, 255), // White
  Color3.FromInts(255, 54, 63), // Red
  Color3.FromInts(255, 136, 31), // Orange
  Color3.FromInts(255, 234, 0), // Yellow
  Color3.FromInts(0, 179, 123), // Green
  Color3.FromInts(0, 106, 122), // Blue
  Color3.FromInts(135, 90, 149), // Purple
  Color3.FromInts(232, 108, 210), // Pink
  Color3.FromInts(34, 34, 34), // Black
]

const materials: Material[] = []

// Material setup
for (let i = 0; i < colors.length; i++) {
  const material = new Material()
  material.albedoColor = colors[i]
  material.metallic = 0.2
  material.roughness = 0.33
  materials.push(material)
}

// Parameters
const VOXEL_SIZE = 0.25
const voxelShape = new BoxShape()

// Adds a voxel to the scene
function addVoxel(x: number, y: number, z: number) {
  log('Voxel added')
  addVoxelSound.getComponent(AudioSource).playOnce()

  const voxel = new Entity()
  voxel.addComponent(
    new Transform({
      position: new Vector3(x, y, z),
      scale: new Vector3(VOXEL_SIZE, VOXEL_SIZE, VOXEL_SIZE),
    })
  )
  voxel.addComponent(materials[colorIndex])
  voxel.addComponent(voxelShape)
  voxel.addComponent(
    new OnPointerDown(
      (e) => {
        let transform = voxel.getComponent(Transform).position
        addVoxel(
          transform.x + e.hit.normal.x * VOXEL_SIZE,
          transform.y + e.hit.normal.y * VOXEL_SIZE,
          transform.z + e.hit.normal.z * VOXEL_SIZE
        )
      },
      {
        button: ActionButton.POINTER,
        showFeedback: false,
      }
    )
  )
  engine.addEntity(voxel)
}

// Highlight
const highlight = new Entity()
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
const highlightMaterial = new Material()
highlightMaterial.albedoColor = colors[colorIndex]
highlightMaterial.roughness = 1.0
highlight.addComponent(highlightMaterial)

// Base grid
const baseGrid = new Entity()
baseGrid.addComponent(new GLTFShape('models/baseGrid.glb'))
baseGrid.addComponent(
  new Transform({
    position: new Vector3(0, 0, 0),
  })
)
baseGrid.addComponent(
  new OnPointerDown(
    (e) => {
      let transform = highlight.getComponent(Transform).position
      addVoxel(transform.x, VOXEL_SIZE / 2 + 0.1, transform.z) // Base grid height is 0.1
    },
    {
      button: ActionButton.POINTER,
      showFeedback: false,
    }
  )
)
engine.addEntity(baseGrid)

// System that casts the rays (for highlight)
let selectedVoxelID: string // The currently highlighted voxel
const voxelsGroup: ComponentGroup = engine.getComponentGroup(Transform)

class RaycastingSystem implements ISystem {
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
            selectedVoxelID = raycastHitEntity.entity.entityId
            highlightFace(engine.entities[selectedVoxelID], raycastHitEntity)
          } else {
            highlightBase(raycastHitEntity)
          }
        }
      } else {
        highlight.getComponent(Transform).scale.setAll(0)
      }
    })
  }
}

// Adds systems to the engine
engine.addSystem(new RaycastingSystem())

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

// Global button events
const input = Input.instance

input.subscribe('BUTTON_DOWN', ActionButton.PRIMARY, false, (): void => {
  log('E Key Pressed')
  setVoxelColor()
  log('Color: ', materials[colorIndex].albedoColor)
})

input.subscribe('BUTTON_DOWN', ActionButton.SECONDARY, false, (): void => {
  log('F Key Pressed')

  // Delete voxel
  for (let entity of voxelsGroup.entities) {
    if (selectedVoxelID == entity.uuid) {
      log('Voxel removed')
      engine.removeEntity(entity)
      removeVoxelSound.getComponent(AudioSource).playOnce()
    }
  }
})

function setVoxelColor(): void {
  colorIndex < colors.length - 1
    ? (colorIndex = colorIndex + 1)
    : (colorIndex = 0)

  highlightMaterial.albedoColor = colors[colorIndex]
}
