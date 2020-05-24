import resources from '../resources'
import { Mode } from '../manager'

export class HUD {
  private container: UIContainerRect
  private addIcon: UIImage
  private subtractIcon: UIImage
  private eyeDropIcon: UIImage

  constructor(canvas: UICanvas) {
    // Container
    this.container = new UIContainerRect(canvas)
    this.container.width = '100%'
    this.container.height = '100%'
    this.container.positionY = 25
    this.container.visible = true
    this.container.isPointerBlocker = false

    // Add icon
    this.addIcon = new UIImage(this.container, resources.icons.add)
    this.addIcon.sourceWidth = 50
    this.addIcon.sourceHeight = 50
    this.addIcon.width = 18
    this.addIcon.height = 19.98 // Compensate by 11.1% for aspect ratio issue
    this.addIcon.positionX = 0
    this.addIcon.positionY = 15
    this.addIcon.isPointerBlocker = false

    // Subtract icon
    this.subtractIcon = new UIImage(this.container, resources.icons.subtract)
    this.subtractIcon.sourceWidth = 50
    this.subtractIcon.sourceHeight = 50
    this.subtractIcon.width = 18
    this.subtractIcon.height = 19.98 // Compensate by 11.1% for aspect ratio issue
    this.subtractIcon.positionX = 0
    this.subtractIcon.positionY = 15
    this.subtractIcon.isPointerBlocker = false
    this.subtractIcon.visible = false

    // Eye drop icon
    this.eyeDropIcon = new UIImage(this.container, resources.icons.eyeDrop)
    this.eyeDropIcon.sourceWidth = 50
    this.eyeDropIcon.sourceHeight = 50
    this.eyeDropIcon.width = 18
    this.eyeDropIcon.height = 19.98 // Compensate by 11.1% for aspect ratio issue
    this.eyeDropIcon.positionX = 0
    this.eyeDropIcon.positionY = 15
    this.eyeDropIcon.isPointerBlocker = false
    this.eyeDropIcon.visible = false
  }

  public switchModeIcon(mode: Mode): void {
    switch (mode) {
      case Mode.Add:
        this.addIcon.visible = true
        this.subtractIcon.visible = false
        this.eyeDropIcon.visible = false
        break
      case Mode.Subtract:
        this.addIcon.visible = false
        this.subtractIcon.visible = true
        this.eyeDropIcon.visible = false
        break
      case Mode.EyeDrop:
        this.addIcon.visible = false
        this.subtractIcon.visible = false
        this.eyeDropIcon.visible = true
        break
      default:
        break
    }
  }
}
