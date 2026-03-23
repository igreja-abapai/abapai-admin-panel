import { httpService } from './http'

export type FinancialTransactionType = 'Entrada' | 'Saída'

export interface FinancialTransaction {
  id: number
  date: string
  type: FinancialTransactionType
  category: string
  amount: string
  description?: string
  createdAt: string
  updatedAt: string
  createdBy?: number
  updatedBy?: number
}

export interface PaginatedTransactionsResponse {
  data: FinancialTransaction[]
  total: number
  page: number
  limit: number
}

export interface GetTransactionsParams {
  page?: number
  limit?: number
  fromDate?: string
  toDate?: string
  type?: FinancialTransactionType
  category?: string
  minAmount?: number
  maxAmount?: number
}

export interface CreateTransactionRequest {
  date: string
  type: FinancialTransactionType
  category: string
  amount: number
  description?: string
}

export interface MonthlySummary {
  month: number
  year: number
  totalIncome: number
  totalExpense: number
  netBalance: number
}

export class FinancesService {
  async getTransactions(params?: GetTransactionsParams): Promise<PaginatedTransactionsResponse> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.fromDate) queryParams.append('fromDate', params.fromDate)
    if (params?.toDate) queryParams.append('toDate', params.toDate)
    if (params?.type) queryParams.append('type', params.type)
    if (params?.category) queryParams.append('category', params.category)
    if (params?.minAmount !== undefined) queryParams.append('minAmount', params.minAmount.toString())
    if (params?.maxAmount !== undefined) queryParams.append('maxAmount', params.maxAmount.toString())

    const queryString = queryParams.toString()
    const url = queryString ? `/finance/transactions?${queryString}` : '/finance/transactions'
    return await httpService.get<PaginatedTransactionsResponse>(url)
  }

  async createTransaction(payload: CreateTransactionRequest): Promise<FinancialTransaction> {
    return await httpService.post<FinancialTransaction>('/finance/transactions', payload)
  }

  async getMonthlySummary(month: number, year: number): Promise<MonthlySummary> {
    return await httpService.get<MonthlySummary>(`/finance/summary?month=${month}&year=${year}`)
  }

  async downloadMonthlyExcel(month: number, year: number): Promise<Blob> {
    const response = await httpService.getBlob(`/finance/export?month=${month}&year=${year}`)
    return response
  }
}

export const financesService = new FinancesService()

