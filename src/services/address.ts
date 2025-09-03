import { httpService } from './http'

export interface Address {
  id: string
  city: string
  country: string
  district: string
  postalCode?: string
  streetName: string
  streetNumber: string
  complement?: string
  state: string
  createdAt?: string
  updatedAt?: string
}

export interface CreateAddressRequest {
  city: string
  country: string
  district: string
  postalCode?: string
  streetName: string
  streetNumber: string
  complement?: string
  state: string
}

export interface UpdateAddressRequest {
  city?: string
  country?: string
  district?: string
  postalCode?: string
  streetName?: string
  streetNumber?: string
  complement?: string
  state?: string
}

export class AddressService {
  async getAddresses(): Promise<Address[]> {
    return await httpService.get<Address[]>('/address')
  }

  async getAddress(id: string): Promise<Address> {
    return await httpService.get<Address>(`/address/${id}`)
  }

  async createAddress(data: CreateAddressRequest): Promise<Address> {
    return await httpService.post<Address>('/address', data)
  }

  async updateAddress(id: string, data: UpdateAddressRequest): Promise<Address> {
    return await httpService.patch<Address>(`/address/${id}`, data)
  }

  async deleteAddress(id: string): Promise<void> {
    return await httpService.delete<void>(`/address/${id}`)
  }
}

export const addressService = new AddressService()
