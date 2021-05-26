import { useChargersService } from "./Chargers.service"
import { useTopicSubscriptions, useTopicsWithPortalId } from "../Mqtt/Mqtt.provider"
import { useObservableState, useSubscription } from "observable-hooks"
import { mqttQuery, PortalId } from "../Mqtt"
import Logger from "../../utils/logger"
import { ChargerInstanceId } from "./Chargers.store"
import { chargersQuery } from "./Chargers.query"

export const useChargers = () => {
  const chargersService = useChargersService()

  const getTopics = (portalId: PortalId) => ({
    chargerInstances: `N/${portalId}/charger/+/DeviceInstance`,
  })

  const topics$ = useTopicsWithPortalId(getTopics, mqttQuery.portalId$)
  const topics = useObservableState(topics$)

  useTopicSubscriptions(topics$)

  useSubscription(mqttQuery.messagesByWildcard$(topics?.chargerInstances ?? ""), (messages) => {
    if (!messages || Object.entries(messages).length === 0) {
      Logger.log("Waiting for chargers...")
    } else {
      const deviceInstances = Object.values(messages) as ChargerInstanceId[]
      if (chargers && !deviceInstances.every((di) => chargers.includes(di))) {
        chargersService.setChargers(deviceInstances)
      }
    }
  })

  const chargers = useObservableState(chargersQuery.chargers$)

  return { chargers }
}
