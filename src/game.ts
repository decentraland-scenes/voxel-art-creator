// Sounds
export const addCubeSound = new Entity()
addCubeSound.addComponent(new Transform())
addCubeSound.getComponent(Transform).position = Camera.instance.position
addCubeSound.addComponent(
  new AudioSource(new AudioClip("sounds/navigationForward.mp3"))
)
engine.addEntity(addCubeSound)

export const removeCubeSound = new Entity()
removeCubeSound.addComponent(new Transform())
removeCubeSound.getComponent(Transform).position = Camera.instance.position
removeCubeSound.addComponent(
  new AudioSource(new AudioClip("sounds/navigationBackward.mp3"))
)
engine.addEntity(removeCubeSound)

// Track color changes
let colorIndex = 0

// Colors to cycle through (7 main colours + white + black)
const colors: Color3[] = [
  Color3.FromInts(255, 255, 255), // white
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
const CUBE_SIZE = 0.25

const cubeShape = new BoxShape()

function spawnCube(x: number, y: number, z: number) {
  log('Cube added')
  addCubeSound.getComponent(AudioSource).playOnce()

  const cube = new Entity()
  cube.addComponent(
    new Transform({
      position: new Vector3(x, y, z),
      scale: new Vector3(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE),
    })
  )
  cube.addComponent(materials[colorIndex])
  cube.addComponent(cubeShape)
  cube.addComponent(
    new OnPointerDown(
      (e) => {
        let transform = cube.getComponent(Transform).position
        spawnCube(
          transform.x + e.hit.normal.x * CUBE_SIZE,
          transform.y + e.hit.normal.y * CUBE_SIZE,
          transform.z + e.hit.normal.z * CUBE_SIZE
        )
      },
      {
        button: ActionButton.POINTER,
        showFeedback: false,
      }
    )
  )
  engine.addEntity(cube)
}

// Highlight
const highlight = new Entity()
highlight.addComponent(new PlaneShape())
highlight.addComponent(
  new Transform({
    position: new Vector3(0, 0, 0),
    scale: new Vector3(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE),
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
      spawnCube(transform.x, CUBE_SIZE / 2 + 0.1, transform.z) // Base grid height is 0.1
    },
    {
      button: ActionButton.POINTER,
      showFeedback: false,
    }
  )
)
engine.addEntity(baseGrid)

// --- System that casts the rays (for highlight) ---
let selectedCubeID: string // The currently highlighted cube
let cubesGroup: ComponentGroup = engine.getComponentGroup(Transform)

class RaycastingSystem implements ISystem {
  update(dt: number) {
    // Fixed ray
    const ray: Ray = {
      origin: fixedRayEntity.getComponent(Transform).position,
      direction: Vector3.Forward(),
      distance: 1000,
    }

    // Ray from camera
    const rayFromCamera: Ray = PhysicsCast.instance.getRayFromCamera(1000)

    // For the camera ray, we cast a hit all
    PhysicsCast.instance.hitFirst(rayFromCamera, (raycastHitEntity) => {
      if (raycastHitEntity.didHit) {
        for (let entity of cubesGroup.entities) {
          
          // Diagnostic logs
          // log(raycastHitEntity.entity.meshName)
          // log(raycastHitEntity.hitNormal)

          // Check entity exists i.e. not been deleted
          if (engine.entities[raycastHitEntity.entity.entityId]) {
            // Highlight
            if (raycastHitEntity.entity.meshName != 'base_collider') {
              selectedCubeID =
                engine.entities[raycastHitEntity.entity.entityId].uuid
              highlightFace(
                engine.entities[raycastHitEntity.entity.entityId],
                raycastHitEntity
              )
            } else {
              highlightBase(raycastHitEntity)
            }
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

function highlightBase(raycastHitEntity: RaycastHitEntity) {
  highlight.getComponent(Transform).rotation = Quaternion.Euler(90, 0, 0)
  let x: number = Math.round(raycastHitEntity.hitPoint.x * 8) / 8
  let y: number = Math.round(raycastHitEntity.hitPoint.y * 8) / 8
  let z: number = Math.round(raycastHitEntity.hitPoint.z * 8) / 8
  highlight.getComponent(Transform).position.x = x
  highlight.getComponent(Transform).position.y = 0.12
  highlight.getComponent(Transform).position.z = z
  highlight.getComponent(Transform).scale.setAll(CUBE_SIZE)
}

function highlightFace(entity: IEntity, raycastHitEntity: RaycastHitEntity) {
  let transform = entity.getComponent(Transform).position.clone() // Clone position of the cube
  highlight.getComponent(Transform).position = transform // Set highlight transform to match the cube
  highlight.getComponent(Transform).scale.setAll(CUBE_SIZE)
  let highlightRotation = highlight.getComponent(Transform).rotation
  if (raycastHitEntity.hitNormal.x != 0) {
    highlightRotation = Quaternion.Euler(0, 90, 0)
    raycastHitEntity.hitNormal.x > 0
      ? (highlight.getComponent(Transform).position.x =
          transform.x + CUBE_SIZE / 1.99) // Offset from cube center with slight offset
      : (highlight.getComponent(Transform).position.x =
          transform.x - CUBE_SIZE / 1.99)
  }
  if (raycastHitEntity.hitNormal.y != 0) {
    highlightRotation = Quaternion.Euler(90, 0, 0)
    raycastHitEntity.hitNormal.y > 0
      ? (highlight.getComponent(Transform).position.y =
          transform.y + CUBE_SIZE / 1.99)
      : (highlight.getComponent(Transform).position.y =
          transform.y - CUBE_SIZE / 1.99)
  }
  if (raycastHitEntity.hitNormal.z != 0) {
    highlightRotation = Quaternion.Euler(0, 0, 90)
    raycastHitEntity.hitNormal.z > 0
      ? (highlight.getComponent(Transform).position.z =
          transform.z + CUBE_SIZE / 1.99)
      : (highlight.getComponent(Transform).position.z =
          transform.z - CUBE_SIZE / 1.99)
  }
  highlight.getComponent(Transform).rotation = highlightRotation
}

// Global button events
const input = Input.instance

input.subscribe('BUTTON_DOWN', ActionButton.POINTER, false, (): void => {
  log('LMB Clicked')
})

input.subscribe('BUTTON_DOWN', ActionButton.PRIMARY, false, (): void => {
  log('E Key Pressed')
  setCubeColor()
  log('Color: ', materials[colorIndex].albedoColor)
})

input.subscribe('BUTTON_DOWN', ActionButton.SECONDARY, false, (): void => {
  log('F Key Pressed')

  // Delete cube
  for (let entity of cubesGroup.entities) {
    if (selectedCubeID == entity.uuid) {
      log('Cube removed')
      engine.removeEntity(entity)
      removeCubeSound.getComponent(AudioSource).playOnce()
    }
  }
})

function setCubeColor(): void {
  colorIndex < colors.length - 1
    ? (colorIndex = colorIndex + 1)
    : (colorIndex = 0)

  highlightMaterial.albedoColor = colors[colorIndex]
}
