import React from "react"

import ColumnContainer from "../ColumnContainer"

import TeslaIcon from "../../images/icons/icon-tesla.svg"
import { observer } from "mobx-react"
import { useVisibilityNotifier } from "app/MarineApp/modules"
import { WIDGET_TYPES } from "app/MarineApp/utils/constants"
// import { translate } from "react-i18nify"  todo: uncomment this when i18n files are ready
import { ListRow } from "../ListViewWithTotals"
import { ListView } from "../ListView"
import { useTopicsState, useTopicSubscriptions } from "@elninotech/mfd-modules"
import { useMemo } from "react"

const Vehicle = observer(() => {
  const vehicle = useVehicle()
  const visible = !!(
    (vehicle.battery_soc &&
      vehicle.charging_status &&
      vehicle.charging_amps &&
      vehicle.battery_soc_setpoint &&
      vehicle.plugged_status) ||
    false
  )

  useVisibilityNotifier({ widgetName: WIDGET_TYPES.VEHICLE, visible })

  const vehicle_name = vehicle.vehicle_name || "My Tesla Vehicle"
  const surplus_deficiency = function () {
    if (vehicle.insufficient_surplus === "true") {
      return " / (Insufficient surplus)"
    } else {
      return ""
    }
  }
  const subtitle = vehicle.charging_status + " / " + vehicle.plugged_status + " " + surplus_deficiency()

  if (visible) {
    return (
      <ColumnContainer>
        <ListView icon={TeslaIcon} title={vehicle_name} subTitle={subtitle} child={false}>
          <ListRow>
            {vehicle.charging_status} @ {vehicle.charging_amps} Amp Limited
          </ListRow>
          <ListRow>
            Battery Level: {vehicle.battery_soc}% of {vehicle.battery_soc_setpoint}%
          </ListRow>
          <ListRow>
            Surplus: {vehicle.surplus_watts}W / Reserved: {vehicle.load_reservation}W
          </ListRow>
        </ListView>
      </ColumnContainer>
    )
  } else {
    return null
  }
})

function useVehicle() {
  const getTopics = function () {
    return {
      vehicle_name: "Tesla/vehicle0/vehicle_name",
      charging_status: "Tesla/vehicle0/charging_status",
      charging_amps: "Tesla/vehicle0/charging_amps",
      battery_soc: "Tesla/vehicle0/battery_soc",
      battery_soc_setpoint: "Tesla/vehicle0/battery_soc_setpoint",
      plugged_status: "Tesla/vehicle0/plugged_status",
      surplus_watts: "Tesla/vehicle0/solar/surplus_watts",
      load_reservation: "Tesla/vehicle0/solar/load_reservation",
      insufficient_surplus: "Tesla/vehicle0/solar/insufficient_surplus",
    }
  }
  const topics = useMemo(function () {
    return getTopics()
  }, [])
  useTopicSubscriptions(topics)
  return useTopicsState(topics)
}

export default Vehicle
