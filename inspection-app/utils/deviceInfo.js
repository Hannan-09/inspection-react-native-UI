import DeviceInfo from 'react-native-device-info';
import { Platform } from 'react-native';

export const getDeviceInformation = async () => {
  try {
    const info = {
      platform: Platform.OS.toUpperCase(),
      manufacturer: await DeviceInfo.getManufacturer(),
      model: DeviceInfo.getModel(),
      deviceName: await DeviceInfo.getDeviceName(),
      osName: DeviceInfo.getSystemName(),
      osVersion: DeviceInfo.getSystemVersion(),
      appVersion: DeviceInfo.getVersion(),
      buildNumber: DeviceInfo.getBuildNumber(),
      uniqueId: await DeviceInfo.getUniqueId(),
    };

    return info;
  } catch (error) {
    console.log('Device Info Error', error);
    return null;
  }
};
