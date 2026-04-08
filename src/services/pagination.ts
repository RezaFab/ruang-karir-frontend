import type { GetSkillsRequest, PaginatedListData, PaginationData } from '../types'

const DEFAULT_PAGE = 1
const DEFAULT_LENGTH = 20
const MAX_LENGTH = 50

type GenericRecord = Record<string, unknown>

function asRecord(value: unknown): GenericRecord | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  return value as GenericRecord
}

function toInteger(
  value: unknown,
  fallback: number,
  options?: { min?: number; max?: number },
): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return fallback
  }

  const normalized = Math.floor(value)
  const min = options?.min ?? Number.NEGATIVE_INFINITY
  const max = options?.max ?? Number.POSITIVE_INFINITY

  return Math.min(Math.max(normalized, min), max)
}

function createFallbackPagination(page: number, length: number, total: number): PaginationData {
  const totalPages = total > 0 ? Math.ceil(total / length) : 0

  return {
    page,
    length,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  }
}

export function normalizeListQueryParams(params?: GetSkillsRequest): Required<GetSkillsRequest> {
  const normalizedSearch = params?.search?.trim() ?? ''

  return {
    search: normalizedSearch,
    page: toInteger(params?.page, DEFAULT_PAGE, { min: 1 }),
    length: toInteger(params?.length, DEFAULT_LENGTH, { min: 1, max: MAX_LENGTH }),
  }
}

export function buildListQueryString(params: Required<GetSkillsRequest>): string {
  const searchParams = new URLSearchParams()

  if (params.search) {
    searchParams.set('search', params.search)
  }

  searchParams.set('page', String(params.page))
  searchParams.set('length', String(params.length))

  return searchParams.toString()
}

export function normalizePaginatedListData<T>(
  rawData: unknown,
  fallbackParams: Required<GetSkillsRequest>,
): PaginatedListData<T> {
  if (Array.isArray(rawData)) {
    return {
      items: rawData as T[],
      pagination: createFallbackPagination(fallbackParams.page, fallbackParams.length, rawData.length),
    }
  }

  const dataRecord = asRecord(rawData)
  const itemsRaw = dataRecord?.items
  const paginationRecord = asRecord(dataRecord?.pagination)

  const items = Array.isArray(itemsRaw) ? (itemsRaw as T[]) : []
  const fallbackPagination = createFallbackPagination(
    fallbackParams.page,
    fallbackParams.length,
    items.length,
  )

  if (!paginationRecord) {
    return {
      items,
      pagination: fallbackPagination,
    }
  }

  const page = toInteger(paginationRecord.page, fallbackPagination.page, { min: 1 })
  const length = toInteger(paginationRecord.length, fallbackPagination.length, {
    min: 1,
    max: MAX_LENGTH,
  })
  const total = toInteger(paginationRecord.total, fallbackPagination.total, { min: 0 })
  const totalPages = toInteger(paginationRecord.totalPages, fallbackPagination.totalPages, { min: 0 })
  const hasNextPage =
    typeof paginationRecord.hasNextPage === 'boolean'
      ? paginationRecord.hasNextPage
      : page < totalPages
  const hasPrevPage =
    typeof paginationRecord.hasPrevPage === 'boolean'
      ? paginationRecord.hasPrevPage
      : page > 1

  return {
    items,
    pagination: {
      page,
      length,
      total,
      totalPages,
      hasNextPage,
      hasPrevPage,
    },
  }
}
