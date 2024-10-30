import { UIEvents } from "./UIEvents";

/**
 * The most basic UI components, about the lisenters & triggers.
 * In AWRPG, it's also the parent class of SceneObject.
 */
export class UIEmitter {
  /** A empty gameObject as the root node */
  root: Phaser.GameObjects.Container;

  /** Record mouse hover or not */
  hovering: boolean = false;

  /** Save the function that will be executed when the confirm key is pressed */
  onConfirm?: () => void;

  /** Save the function that will be executed when the cancel key is pressed */
  onCancel?: () => void;

  constructor(
    scene: Phaser.Scene,
    onConfirm?: () => void,
    onCancel?: () => void
  ) {
    // Create the root container
    this.root = new Phaser.GameObjects.Container(scene, 0, 0);
    this.onConfirm = onConfirm;
    this.onCancel = onCancel;
  }

  //==================================================================
  //    About the listeners
  //==================================================================
  /**
   * Add a listener for a given event.
   * @param event The event name.
   * @param fn The listener function.
   * @param context The context to invoke the listener with. Default this.
   */
  on(event: string | symbol, fn: Function, context?: any): UIEmitter {
    this.root.on(event, fn, context);
    return this;
  }

  /**
   * Add a one-time listener for a given event.
   * @param event The event name.
   * @param fn The listener function.
   * @param context The context to invoke the listener with. Default this.
   */
  once(event: string | symbol, fn: Function, context?: any): UIEmitter {
    this.root.once(event, fn, context);
    return this;
  }

  /**
   * Remove the listeners of a given event or all listeners
   * @param event The event name.
   * @param fn Only remove the listeners that match this function.
   * @param context Only remove the listeners that have this context.
   * @param once Only remove one-time listeners.
   */
  off(
    event?: string | symbol,
    fn?: Function,
    context?: any,
    once?: boolean
  ): UIEmitter {
    if (event) {
      this.root.off(event, fn, context, once);
    } else {
      this.root.removeAllListeners();
    }
    return this;
  }

  /**
   * Return the listeners registered for a given event.
   * @param event The event name.
   */
  listeners(event: string | symbol): Function[] {
    return this.root.listeners(event);
  }

  /**
   * Return the number of listeners listening to a given event.
   * @param event The event name.
   */
  listenerCount(event: string | symbol): number {
    return this.root.listenerCount(event);
  }

  /**
   * Calls each of the listeners registered for a given event.
   * @param event The event name.
   * @param args Additional arguments that will be passed to the event handler.
   */
  emit(event: string | symbol, ...args: any[]): boolean {
    return this.root.emit(event, ...args);
  }

  //==================================================================
  //    About the triggers
  //    The config of keys is in the UIEvents.ts file
  //==================================================================
  /**
   * When focus is gained
   */
  onFocus() {}

  /**
   * When focus is lost
   */
  onBlur() {}

  /**
   * When pressing the up key
   */
  onUpPressed() {
    this.emit(UIEvents.ARROW, this);
    this.emit(UIEvents.UP, this);
  }

  /**
   * When pressing the down key
   */
  onDownPressed() {
    this.emit(UIEvents.ARROW, this);
    this.emit(UIEvents.DOWN, this);
  }

  /**
   * When pressing the left key
   */
  onLeftPressed() {
    this.emit(UIEvents.ARROW, this);
    this.emit(UIEvents.LEFT, this);
  }

  /**
   * When pressing the right key
   */
  onRightPressed() {
    this.emit(UIEvents.ARROW, this);
    this.emit(UIEvents.RIGHT, this);
  }

  /**
   * When confirm key is pressed
   */
  onConfirmPressed() {
    this.emit(UIEvents.CONFIRM, this);
    if (this.onConfirm) this.onConfirm();
  }

  /**
   * When cancel key is pressed
   */
  onCancelPressed() {
    this.emit(UIEvents.CANCEL, this);
    if (this.onCancel) this.onCancel();
  }

  /**
   * When the menu key is pressed
   */
  onMenuPressed() {
    this.emit(UIEvents.MENU, this);
  }

  /**
   * When item has been selected (UIList)
   */
  onSelected() {}

  /**
   * When item has been unselected (UIList)
   */
  onUnSelected() {}

  /**
   * When hovering the mouse
   */
  onHover() {
    this.hovering = true;
  }

  /**
   * When the mouse over
   */
  onUnHover() {
    this.hovering = false;
  }
}
