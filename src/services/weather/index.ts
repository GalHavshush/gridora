import { getOpenMeteoWeather } from './openMeteo'

export type * from './types'

/** The active weather provider. Point this at another `WeatherProvider` to switch services. */
export const getWeather = getOpenMeteoWeather
