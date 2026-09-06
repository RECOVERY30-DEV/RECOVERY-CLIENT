'use client'

import type { KyInstance } from 'ky'

import { useForecastSummaryQueries } from '@/features/forecast'
import { DEMO_BUSINESS_ID } from '@/shared/config/business'

import { createHomeForecastViewModel } from '../model/home-forecast-view-model'
import {
  BusinessHomeErrorScreen,
  BusinessHomeLoadingScreen,
  BusinessHomeScreen,
} from './business-home-screen'

type BusinessHomeContainerProps = Readonly<{
  client?: KyInstance
  referenceAt?: Date
}>

export function BusinessHomeContainer({ client, referenceAt }: BusinessHomeContainerProps = {}) {
  const queries = useForecastSummaryQueries(
    DEMO_BUSINESS_ID,
    client === undefined ? {} : { client },
  )
  const queryResults = [
    queries.latest,
    queries.minBalance,
    queries.shortfall,
    queries.safetyBuffer,
    queries.coverage,
  ]

  if (queryResults.some((query) => query.isError)) {
    const retryFailedQueries = () => {
      queryResults.forEach((query) => {
        if (query.isError) {
          void query.refetch()
        }
      })
    }

    return <BusinessHomeErrorScreen onRetry={retryFailedQueries} />
  }

  if (
    queries.latest.data === undefined ||
    queries.minBalance.data === undefined ||
    queries.shortfall.data === undefined ||
    queries.safetyBuffer.data === undefined ||
    queries.coverage.data === undefined
  ) {
    return <BusinessHomeLoadingScreen />
  }

  const data = createHomeForecastViewModel(
    {
      latest: queries.latest.data,
      minBalance: queries.minBalance.data,
      shortfall: queries.shortfall.data,
      safetyBuffer: queries.safetyBuffer.data,
      coverage: queries.coverage.data,
    },
    referenceAt,
  )

  return <BusinessHomeScreen data={data} />
}
