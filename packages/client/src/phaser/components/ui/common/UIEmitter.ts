import { UIEvents } from "./UIEvents";

export class UIEmitter {
  /** A empty gameObject as the root node*/
  root: Phaser.GameObjects.Container;

  /** Mouse over */
  hovering: boolean = false;

  /** trigger */
  onConfirm?: () => void;
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

  //===========================================
  //    About the listeners
  //===========================================
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

  //===========================================
  //    About the triggers
  //===========================================
  onFocus() {}
  onBlur() {}
  onUpPressed() {
    this.emit(UIEvents.ARROW, this);
    this.emit(UIEvents.UP, this);
  }
  onDownPressed() {
    this.emit(UIEvents.ARROW, this);
    this.emit(UIEvents.DOWN, this);
  }
  onLeftPressed() {
    this.emit(UIEvents.ARROW, this);
    this.emit(UIEvents.LEFT, this);
  }
  onRightPressed() {
    this.emit(UIEvents.ARROW, this);
    this.emit(UIEvents.RIGHT, this);
  }

  onConfirmPressed() {
    this.emit(UIEvents.CONFIRM, this);
    if (this.onConfirm) this.onConfirm();
  }

  onCancelPressed() {
    this.emit(UIEvents.CANCEL, this);
    if (this.onCancel) this.onCancel();
  }

  onSelected() {}
  onUnSelected() {}
  onHover() {
    this.hovering = true;
  }
  onUnHover() {
    this.hovering = false;
  }
}
