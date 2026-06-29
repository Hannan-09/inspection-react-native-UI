import AsyncStorage from "@react-native-async-storage/async-storage";

const normalizeEnum = (val) => {
  if (!val) return null;
  if (val === "NA" || val === "N/A") return "N/A";
  return val.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
};

export const mapReportToSectionState = (report, key, category) => {
  if (key === "section_1_engine_powertrain") {
    const s = report.engineAndPowertrain || {};
    if (category === "2W") {
      return {
        engine_sound_video: s.engineSoundVideo || null,
        overheating: normalizeEnum(s.overheating),
        misfiring_smoke: normalizeEnum(s.misfiringSmoke),
        back_compression: normalizeEnum(s.backCompression),
        oil_leakage: normalizeEnum(s.oilLeakage),
        coolant_leakage: normalizeEnum(s.coolantLeakage),
        engine_mount_condition: normalizeEnum(s.engineMountCondition),
        exhaust_leaks: normalizeEnum(s.exhaustLeaks),
        fuel_lines: normalizeEnum(s.fuelLines),
        fuel_tank: normalizeEnum(s.fuelTank),
        gaskets_and_seals: normalizeEnum(s.gasketsAndSeals),
        wiring_harness: normalizeEnum(s.wiringHarness),
        wiring_harness_photo: s.wiringHarnessPhoto || null,
        battery_voltage: normalizeEnum(s.batteryVoltage),
        battery_voltage_value: s.batteryVoltageValue?.toString() || "",
        alternator_starter: normalizeEnum(s.alternatorStarter),
        gear_shifting: normalizeEnum(s.gearShifting),
        gearbox_leaks: normalizeEnum(s.gearboxLeaks),
        clutch_life_percent: s.clutchLifePercent !== undefined && s.clutchLifePercent !== null ? s.clutchLifePercent : "",
        exhaust_condition: normalizeEnum(s.exhaustCondition),
        carburetor_or_injector: normalizeEnum(s.carburetorOrInjector),
        battery_and_voltage: normalizeEnum(s.batteryAndVoltage),
        self_start_functioning: normalizeEnum(s.selfStartFunctioning),
        chain_sprocket_condition: normalizeEnum(s.chainSprocketCondition),
        clutch_condition: normalizeEnum(s.clutchCondition)
      };
    }
    return {
      engine_sound_video: s.engineSoundVideo || null,
      overheating: normalizeEnum(s.overheating),
      misfiring_smoke: normalizeEnum(s.misfiringSmoke),
      back_compression: normalizeEnum(s.backCompression),
      oil_leakage: normalizeEnum(s.oilLeakage),
      coolant_leakage: normalizeEnum(s.coolantLeakage),
      engine_mount_condition: normalizeEnum(s.engineMountCondition),
      gaskets_and_seals: normalizeEnum(s.gasketsAndSeals),
      throttle_body: normalizeEnum(s.throttleBody),
      exhaust_leaks: normalizeEnum(s.exhaustLeaks),
      catalytic_converter: normalizeEnum(s.catalyticConverter),
      catalytic_converter_photo: s.catalyticConverterPhoto || null,
      fuel_tank: normalizeEnum(s.fuelTank),
      fuel_lines: normalizeEnum(s.fuelLines),
      fuel_rails_injectors: normalizeEnum(s.fuelRailsInjectors),
      wiring_harness: normalizeEnum(s.wiringHarness),
      wiring_harness_photo: s.wiringHarnessPhoto || null,
      battery_voltage: normalizeEnum(s.batteryVoltage),
      battery_voltage_value: s.batteryVoltageValue?.toString() || "",
      alternator_starter: normalizeEnum(s.alternatorStarter),
      gear_shifting: normalizeEnum(s.gearShifting),
      gearbox_leaks: normalizeEnum(s.gearboxLeaks),
      clutch_life_percent: s.clutchLifePercent !== undefined && s.clutchLifePercent !== null ? s.clutchLifePercent : "",
      drive_shaft_axle: normalizeEnum(s.driveShaftAxle)
    };
  }
  if (key === "section_1_ev_battery") {
    const s = report.evBattery || {};
    return {
      motor_running_video: s.motorRunningVideo || null,
      battery_soh_percent: s.batterySohPercent !== undefined && s.batterySohPercent !== null ? s.batterySohPercent : "",
      battery_soc_percent: s.batterySocPercent !== undefined && s.batterySocPercent !== null ? s.batterySocPercent : "",
      battery_pack_condition: normalizeEnum(s.batteryPackCondition),
      battery_pack_condition_photo: s.batteryPackPhoto || null,
      battery_thermal_cooling: normalizeEnum(s.batteryThermalCooling),
      battery_thermal_cooling_photo: s.batteryThermalCoolingPhoto || null,
      charging_port_condition: normalizeEnum(s.chargingPortCondition),
      charging_port_condition_photo: s.chargingPortPhoto || null,
      bms_warning_light: normalizeEnum(s.bmsWarningLight),
      bms_warning_light_photo: s.bmsWarningLightPhoto || null,
      range_indicator_functional: normalizeEnum(s.rangeIndicatorFunctional),
      range_indicator_functional_photo: s.rangeIndicatorFunctionalPhoto || null,
      motor_noise_vibration: normalizeEnum(s.motorNoiseVibration),
      motor_noise_vibration_photo: s.motorNoiseVibrationPhoto || null,
      regenerative_braking_active: normalizeEnum(s.regenerativeBrakingActive),
      regenerative_braking_active_photo: s.regenerativeBrakingActivePhoto || null,
      hv_wiring_harness: normalizeEnum(s.hvWiringHarness),
      hv_wiring_harness_photo: s.hvWiringHarnessPhoto || null,
      dc_dc_converter: normalizeEnum(s.dcDcConverter),
      dc_dc_converter_photo: s.dcDcConverterPhoto || null,
      onboard_charger_status: normalizeEnum(s.onboardChargerStatus),
      onboard_charger_status_photo: s.onboardChargerStatusPhoto || null
    };
  }
  if (key === "section_2_mechanical") {
    const s = report.mechanical || {};
    if (category === "2W") {
      return {
        steering_performance: normalizeEnum(s.steeringPerformance),
        front_fork_condition: normalizeEnum(s.frontForkCondition),
        rear_shock_condition: normalizeEnum(s.rearShockCondition),
        rear_shock_condition_photo: s.rearShockConditionPhoto || null,
        swingarm_bushings: normalizeEnum(s.swingarmBushings),
        suspension_noise: normalizeEnum(s.suspensionNoise),
        front_brake_condition: normalizeEnum(s.frontBrakeCondition),
        front_brake_condition_photo: s.frontBrakeConditionPhoto || null,
        rear_brake_condition: normalizeEnum(s.rearBrakeCondition),
        brake_pad_life_percent: s.brakePadLifePercent !== undefined && s.brakePadLifePercent !== null ? s.brakePadLifePercent : "",
        brake_cables_or_lines: normalizeEnum(s.brakeCablesOrLines)
      };
    }
    return {
      steering_performance: normalizeEnum(s.steeringPerformance),
      steering_rack_leakage: normalizeEnum(s.steeringRackLeakage),
      shocks_struts: normalizeEnum(s.shocksStruts),
      shocks_struts_photo: s.shocksStrutsPhoto || null,
      ball_joints_bushes: normalizeEnum(s.ballJointsBushes),
      suspension_noise: normalizeEnum(s.suspensionNoise),
      disc_drum_brake_condition: normalizeEnum(s.discDrumBrakeCondition),
      disc_drum_brake_condition_photo: s.discDrumBrakePhoto || null,
      mag_wheel_brake_condition: normalizeEnum(s.magWheelBrakeCondition),
      mag_wheel_brake_condition_photo: s.magWheelBrakePhoto || null,
      brake_pad_life_percent: s.brakePadLifePercent !== undefined && s.brakePadLifePercent !== null ? s.brakePadLifePercent : "",
      mag_wheel_brake_pad_life_percent: s.magWheelBrakePadLifePercent !== undefined && s.magWheelBrakePadLifePercent !== null ? s.magWheelBrakePadLifePercent : "",
      brake_fluid_lines: normalizeEnum(s.brakeFluidLines),
      abs_warning_light: normalizeEnum(s.absWarningLight),
      abs_warning_light_photo: s.absWarningLightPhoto || null,
      drum_brake: s.drumBrake !== undefined && s.drumBrake !== null ? s.drumBrake : null,
      mag_wheel: s.magWheel !== undefined && s.magWheel !== null ? s.magWheel : null
    };
  }
  if (key === "section_3_exterior_panels") {
    const panels = {};
    const s = report.exteriorPanels || {};
    (s.panels || []).forEach(p => {
      const isNa = p.dentSeverity === "NA" && p.scratchSeverity === "NA";
      panels[p.panelName] = {
        is_na: isNa,
        original_paint: p.originalPaint,
        repainted: p.repainted,
        dent_severity: normalizeEnum(p.dentSeverity),
        scratch_severity: normalizeEnum(p.scratchSeverity),
        rust_present: p.rustPresent,
        dent_photo: p.dentPhoto ? (Array.isArray(p.dentPhoto) ? p.dentPhoto : [p.dentPhoto]) : [],
        scratch_photo: p.scratchPhoto ? (Array.isArray(p.scratchPhoto) ? p.scratchPhoto : [p.scratchPhoto]) : [],
        panel_photo: p.panelPhoto ? (Array.isArray(p.panelPhoto) ? p.panelPhoto : [p.panelPhoto]) : []
      };
    });
    return panels;
  }
  if (key === "section_4_glass_exterior_electronics") {
    const s = report.glassAndExteriorElectronics || {};
    if (category === "2W") {
      return {
        headlight_condition: normalizeEnum(s.headlightCondition),
        tail_light_indicators: normalizeEnum(s.tailLightIndicators),
        speedometer_cluster: normalizeEnum(s.speedometerCluster),
        mirrors: normalizeEnum(s.mirrors),
        visor_windshield: normalizeEnum(s.visorWindshield)
      };
    }
    return {
      front_windshield: normalizeEnum(s.frontWindshield),
      glass_cracks_chips: normalizeEnum(s.glassCracksChips),
      left_side_mirror: normalizeEnum(s.leftSideMirror),
      right_side_mirror: normalizeEnum(s.rightSideMirror),
      parking_sensors: normalizeEnum(s.parkingSensors),
      parking_sensors_photo: s.parkingSensorsPhoto || null,
      exterior_lights_all: normalizeEnum(s.exteriorLightsAll),
      wipers_washers: normalizeEnum(s.wipersWashers),
      headlight: normalizeEnum(s.headlight),
      fog_lamp: normalizeEnum(s.fogLamp),
      fog_lamp_photo: s.fogLampPhoto || null,
      tail_light: normalizeEnum(s.tailLight),
      front_wiper: normalizeEnum(s.frontWiper),
      rear_wiper: normalizeEnum(s.rearWiper),
      rear_wiper_photo: s.rearWiperPhoto || null,
      rear_windshield: normalizeEnum(s.rearWindshield)
    };
  }
  if (key === "section_5_interior_cabin" || key === "section_5_comfort_electronics") {
    const s = report.interiorAndCabin || report.comfortAndElectronics || {};
    if (category === "2W") {
      return {
        horn: normalizeEnum(s.horn),
        usb_charging_port: normalizeEnum(s.usbChargingPort),
        instrument_cluster_display: normalizeEnum(s.instrumentClusterDisplay),
        mobile_connectivity_tft: normalizeEnum(s.mobileConnectivityTft),
        seat_condition: normalizeEnum(s.seatCondition),
        grab_rail_pillion: normalizeEnum(s.grabRailPillion),
        storage_box_underseat: normalizeEnum(s.storageBoxUnderseat)
      };
    }
    return {
      ac_cooling: normalizeEnum(s.acCooling),
      ac_heating: normalizeEnum(s.acHeating),
      ac_compressor: normalizeEnum(s.acCompressor),
      ac_gas_leakage: normalizeEnum(s.acGasLeakage),
      hvac_climate_control: normalizeEnum(s.hvacClimateControl),
      speakers: normalizeEnum(s.speakers),
      music_system: normalizeEnum(s.musicSystem),
      infotainment_system: normalizeEnum(s.infotainmentSystem),
      ventilated_seat: normalizeEnum(s.ventilatedSeat),
      ventilated_seat_photo: s.ventilatedSeatPhoto || null,
      back_camera: normalizeEnum(s.backCamera),
      back_camera_photo: s.backCameraPhoto || null,
      camera_360: normalizeEnum(s.camera360),
      camera_360_photo: s.camera360Photo || null,
      cruise_control: normalizeEnum(s.cruiseControl),
      cruise_control_photo: s.cruiseControlPhoto || null,
      interior_lights: normalizeEnum(s.interiorLights),
      central_locking: normalizeEnum(s.centralLocking),
      power_windows_all: normalizeEnum(s.powerWindowsAll),
      front_left_window_condition: normalizeEnum(s.frontLeftWindowCondition),
      front_right_window_condition: normalizeEnum(s.frontRightWindowCondition),
      rear_left_window_condition: normalizeEnum(s.rearLeftWindowCondition),
      rear_right_window_condition: normalizeEnum(s.rearRightWindowCondition),
      reverse_camera_sensors: normalizeEnum(s.reverseCameraSensors),
      reverse_camera_sensors_photo: s.reverseCameraSensorsPhoto || null,
      airbag: normalizeEnum(s.airbag),
      seat_condition: normalizeEnum(s.seatCondition),
      dashboard_condition: normalizeEnum(s.dashboardCondition),
      odometer_reading: s.odometerReading !== undefined && s.odometerReading !== null ? s.odometerReading.toString() : "",
      speedometer_photo: s.speedometerPhoto || null,
      interior_full_video: s.interiorFullVideo || null
    };
  }
  if (key === "section_6_structural_history") {
    const s = report.structuralHistory || {};
    if (category === "2W") {
      return {
        frame_condition: normalizeEnum(s.frameCondition),
        frame_condition_photo: s.frameConditionPhoto || null,
        accident_repair_visible: normalizeEnum(s.accidentRepairVisible),
        flood_damage_confirmed: normalizeEnum(s.floodDamageConfirmed),
        chassis_number_intact: normalizeEnum(s.chassisNumberIntact),
        chassis_number_intact_photo: s.chassisNumberIntactPhoto || null,
        engine_number_intact: normalizeEnum(s.engineNumberIntact),
        engine_number_intact_photo: s.engineNumberIntactPhoto || null
      };
    }
    return {
      structural_damage: normalizeEnum(s.structuralDamage),
      structural_damage_photo: s.structuralDamagePhotos || [],
      flood_damage_confirmed: normalizeEnum(s.floodDamageConfirmed),
      flood_damage_confirmed_photo: s.floodDamageConfirmedPhotos || [],
      underbody_condition: normalizeEnum(s.underbodyCondition),
      underbody_condition_photo: s.underbodyConditionPhotos || [],
      other_rusting: normalizeEnum(s.otherRusting),
      other_rusting_photo: s.otherRustingPhotos || [],
      chassis_alignment: normalizeEnum(s.chassisAlignment),
      chassis_alignment_photo: s.chassisAlignmentPhotos || []
    };
  }
  if (key === "section_7_tyres") {
    const s = report.tyres || {};
    if (category === "2W") {
      return {
        "Front": {
          tread_depth_mm: s.frontTreadDepthMm !== undefined && s.frontTreadDepthMm !== null ? s.frontTreadDepthMm.toString() : "",
          tyre_condition: s.frontTyreCondition !== undefined && s.frontTyreCondition !== null ? s.frontTyreCondition.toString() : "",
          condition: normalizeEnum(s.frontCondition) || "",
          tyre_photo: s.frontTyrePhoto || null
        },
        "Rear": {
          tread_depth_mm: s.rearTreadDepthMm !== undefined && s.rearTreadDepthMm !== null ? s.rearTreadDepthMm.toString() : "",
          tyre_condition: s.rearTyreCondition !== undefined && s.rearTyreCondition !== null ? s.rearTyreCondition.toString() : "",
          condition: normalizeEnum(s.rearCondition) || "",
          tyre_photo: s.rearTyrePhoto || null
        }
      };
    }
    return {
      "Front Left": {
        tread_depth_mm: s.frontLeftTreadDepthMm !== undefined && s.frontLeftTreadDepthMm !== null ? s.frontLeftTreadDepthMm.toString() : "",
        tyre_condition: s.frontLeftTyreCondition !== undefined && s.frontLeftTyreCondition !== null ? s.frontLeftTyreCondition.toString() : "",
        condition: normalizeEnum(s.frontLeftCondition) || "",
        tyre_photo: s.frontLeftTyrePhoto || null
      },
      "Front Right": {
        tread_depth_mm: s.frontRightTreadDepthMm !== undefined && s.frontRightTreadDepthMm !== null ? s.frontRightTreadDepthMm.toString() : "",
        tyre_condition: s.frontRightTyreCondition !== undefined && s.frontRightTyreCondition !== null ? s.frontRightTyreCondition.toString() : "",
        condition: normalizeEnum(s.frontRightCondition) || "",
        tyre_photo: s.frontRightTyrePhoto || null
      },
      "Rear Left": {
        tread_depth_mm: s.rearLeftTreadDepthMm !== undefined && s.rearLeftTreadDepthMm !== null ? s.rearLeftTreadDepthMm.toString() : "",
        tyre_condition: s.rearLeftTyreCondition !== undefined && s.rearLeftTyreCondition !== null ? s.rearLeftTyreCondition.toString() : "",
        condition: normalizeEnum(s.rearLeftCondition) || "",
        tyre_photo: s.rearLeftTyrePhoto || null
      },
      "Rear Right": {
        tread_depth_mm: s.rearRightTreadDepthMm !== undefined && s.rearRightTreadDepthMm !== null ? s.rearRightTreadDepthMm.toString() : "",
        tyre_condition: s.rearRightTyreCondition !== undefined && s.rearRightTyreCondition !== null ? s.rearRightTyreCondition.toString() : "",
        condition: normalizeEnum(s.rearRightCondition) || "",
        tyre_photo: s.rearRightTyrePhoto || null
      },
      spare_tyre_condition: normalizeEnum(s.spareTyreCondition),
      spare_tyre_condition_photo: s.spareTyrePhoto || null
    };
  }
  if (key === "section_8_obd_diagnostics") {
    const s = report.obdDiagnostics || {};
    return {
      obd_scan_done: normalizeEnum(s.obdScanDone),
      error_codes_present: s.errorCodesPresent === true,
      error_code_details: s.errorCodeDetails || "",
      error_codes_present_photo: s.errorCodesPhoto || null,
      emission_status: normalizeEnum(s.emissionStatus)
    };
  }
  if (key === "section_9_modifications") {
    const s = report.modifications || {};
    return {
      modifications_detected: s.modificationsDetected === true,
      modification_count: s.modificationCount !== undefined && s.modificationCount !== null ? s.modificationCount : "",
      modification_risk_level: normalizeEnum(s.modificationRiskLevel),
      seller_declaration_match: s.sellerDeclarationMatch === true,
      modification_items: (s.modificationItems || []).map(m => ({
        modification_category: m.modificationCategory || "",
        modification_type: m.modificationType || "",
        is_oem: m.isOem === true,
        impact_on_warranty: normalizeEnum(m.impactOnWarranty),
        impact_on_safety: normalizeEnum(m.impactOnSafety),
        documentation_available: m.documentationAvailable === true,
        photo: m.photo || null,
        remarks: m.remarks || ""
      }))
    };
  }
  if (key === "section_10_media") {
    const s = report.media || {};
    return {
      engine_or_motor_running_video: s.engineOrMotorRunningVideo || null,
      test_drive_video: s.testDriveVideo || null,
      test_ride_video: s.testRideVideo || null,
      underbody_photos: s.underbodyPhotos || [],
      major_dent_photos: s.majorDentPhotos || [],
      chassis_number_photo: s.chassisNumberPhoto || null,
      engine_number_photo: s.engineNumberPhoto || null,
      full_vehicle_walkaround_photos: s.fullVehicleWalkaroundPhotos || []
    };
  }
  if (key === "section_11_vehicle_specs") {
    const s = report.vehicleDocuments || report.vehicleSpecs || {};
    return {
      chassis_no: s.chassisNumber || s.chassisNo || "",
      engine_no: s.engineNumber || s.engineNo || "",
      owner_count: (s.ownerCount !== undefined && s.ownerCount !== null) ? s.ownerCount : "",
      reg_date: s.registrationDate || s.regDate || "",
      rc_upto_date: s.rcValidUptoDate || s.rcUptoDate || "",
      vehicle_tax_upto_date: s.vehicleTaxUptoDate || "",
      insurance_upto_date: s.insuranceUptoDate || "",
      vehicle_cc: (s.vehicleCc !== undefined && s.vehicleCc !== null) ? s.vehicleCc : "",
      vehicle_gross_weight: (s.vehicleGrossWeight !== undefined && s.vehicleGrossWeight !== null) ? s.vehicleGrossWeight : "",
      vehicle_cylinder: (s.vehicleCylinderCount !== undefined && s.vehicleCylinderCount !== null) ? s.vehicleCylinderCount : ((s.vehicleCylinder !== undefined && s.vehicleCylinder !== null) ? s.vehicleCylinder : ""),
      puc_no: s.pucNumber || s.pucNo || "",
      puc_upto_date: s.pucValidUptoDate || s.pucUptoDate || "",
      blacklist_details: s.blacklistDetails || [],
      challan_details: s.challanDetails ? s.challanDetails.map(c => ({
          challan_no: c.challanNumber || c.challan_no || "",
          challan_date: c.challanDate ? c.challanDate.replace("T", " ") : (c.challan_date || ""),
          challan_amount: c.amount || c.challan_amount || "",
          challan_location: c.location || c.challan_location || "",
          owner_name: c.ownerName || c.owner_name || "",
          violation_details: c.offence ? [{ offence: c.offence, penalty: c.penaltyAmount || 0 }] : (c.violation_details || []),
          challan_status: c.status || c.challan_status || ""
      })) : [],
      permit_no: s.permitNumber || s.permitNo || "",
      permit_type: s.permitType || "",
      permit_from_date: s.permitFromDate || "",
      permit_to_date: s.permitToDate || "",
      national_permit_no: s.nationalPermitNumber || s.nationalPermitNo || "",
      national_permit_upto_date: s.nationalPermitValidUptoDate || s.nationalPermitUptoDate || "",
      rto_code: s.rtoCode || ""
    };
  }
  return {};
};

/**
 * Downloads and populates all relevant inspection sections in AsyncStorage using GET_REPORT data.
 * This effectively restores form state from DB so inspector can edit a submitted report.
 */
export const populateInspectionStorage = async (inspectionAPI, inspectionId, category, fuelType) => {
  try {
    const res = await inspectionAPI.getInspectionReport(inspectionId, category);
    const report = res.data || res;
    if (!report) {
      throw new Error("Empty report response from server");
    }

    const isEV = (fuelType || report.fuelType || "").toUpperCase().includes("ELECTRIC") || 
                 (fuelType || report.fuelType || "").toUpperCase() === "EV";
    const is4W = category === "4W";

    const sections = [
      { key: isEV ? "section_1_ev_battery" : "section_1_engine_powertrain" },
      { key: "section_2_mechanical" },
      { key: "section_3_exterior_panels" },
      { key: "section_4_glass_exterior_electronics" },
      { key: is4W ? "section_5_interior_cabin" : "section_5_comfort_electronics" },
      { key: "section_6_structural_history" },
      { key: "section_7_tyres" },
      ...(!isEV ? [{ key: "section_8_obd_diagnostics" }] : []),
      { key: "section_9_modifications" },
      { key: "section_10_media" },
      { key: "section_11_vehicle_specs" }
    ];

    const progress = {};
    const storageKeys = [];
    const storagePairs = [];

    for (const section of sections) {
      const stateData = mapReportToSectionState(report, section.key, category);
      progress[section.key] = "completed";
      
      const storageKey = `inspection_${inspectionId}_${section.key}`;
      storageKeys.push(storageKey);
      storagePairs.push([storageKey, JSON.stringify(stateData)]);
    }

    const progressKey = `inspection_${inspectionId}_progress`;
    storagePairs.push([progressKey, JSON.stringify(progress)]);

    await AsyncStorage.multiSet(storagePairs);
    console.log(`Successfully populated storage for inspection ID: ${inspectionId}`);
    return true;
  } catch (error) {
    console.error("Error pre-populating AsyncStorage:", error);
    throw error;
  }
};
