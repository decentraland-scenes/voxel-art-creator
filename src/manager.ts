import resources from './resources'
import { Audio } from './modules/audio'

/*
 Manager for mode, color and sound
*/

// Mode
export enum Mode {
  Add = 0,
  Subtract = 1,
  EyeDrop = 2
}

// Sound entities
const addVoxelSound = new Audio(resources.sounds.add)
const subtractVoxelSound = new Audio(resources.sounds.subtract)
const eyeDropVoxelSound = new Audio(resources.sounds.eyeDrop)

// Colors to cycle through (7 main colours + white + black)
export const colors: Color3[] = [
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

export const materials: Material[] = []

// Material setup
for (let i = 0; i < colors.length; i++) {
  const material = new Material()
  material.albedoColor = colors[i]
  material.metallic = 0.2
  material.roughness = 0.33
  materials.push(material)
}

export class Manager {

  public static colorIndex: number = 0
  public static activeMode = Mode.Add

  // Sound
  public static playAddVoxelSound(): void {
    addVoxelSound.getComponent(AudioSource).playOnce()
  }

  public static playSubtractVoxelSound(): void {
    subtractVoxelSound.getComponent(AudioSource).playOnce()
  }

  public static playEyeDropVoxelSound(): void {
    eyeDropVoxelSound.getComponent(AudioSource).playOnce()
  }

  // Color
  public static setVoxelColor(): void {
    Manager.colorIndex < colors.length - 1
      ? (Manager.colorIndex = Manager.colorIndex + 1)
      : (Manager.colorIndex = 0)
  }
}
