import { ActivityType } from '../types';

class ActivityDetector {
  private lastSpeed: number = 0;
  private motionMagnitude: number = 0;
  private listenersSet: boolean = false;

  constructor() {
    this.startMotionListener();
  }

  // Request permission for iOS 13+ devices
  public async requestPermission(): Promise<boolean> {
    if (
      typeof DeviceMotionEvent !== 'undefined' &&
      (DeviceMotionEvent as any).requestPermission
    ) {
      try {
        const response = await (DeviceMotionEvent as any).requestPermission();
        return response === 'granted';
      } catch (e) {
        console.error(e);
        return false;
      }
    }
    return true;
  }

  private startMotionListener() {
    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('devicemotion', (event: any) => {
        // 'any' casting used because DeviceMotionEvent type availability varies in web vs native contexts
        if (event.acceleration) {
          const { x, y, z } = event.acceleration;
          // Calculate magnitude vector
          if (x !== null && y !== null && z !== null) {
            this.motionMagnitude = Math.sqrt(x * x + y * y + z * z);
          }
        }
      });
      this.listenersSet = true;
    }
  }

  // Determine activity based on Speed (m/s) and Motion
  public detect(speedKmh: number): ActivityType {
    const isMovingFast = speedKmh > 15; // > 15 km/h
    const isHighMotion = this.motionMagnitude > 2; // Arbitrary threshold for movement

    if (isMovingFast) {
      return ActivityType.DRIVING;
    }
    
    if (isHighMotion) {
      // Differentiate walking vs gym based on pattern ideally, 
      // but strictly magnitude suggests active.
      return ActivityType.GYM;
    }

    // Default fallbacks if no strong signal
    return ActivityType.RELAXING; 
  }

  public getMotionLevel(): number {
    return this.motionMagnitude;
  }
}

export const activityDetector = new ActivityDetector();