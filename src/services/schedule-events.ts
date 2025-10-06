import { httpService } from './http'

export interface ScheduleEvent {
  id: number
  name: string
  time: string
  days: string[] | string
  position: number
  createdAt: string
  updatedAt: string
}

export interface CreateScheduleEventRequest {
  name: string
  time: string
  days: string[] | string
  position?: number
}

export type UpdateScheduleEventRequest = Partial<CreateScheduleEventRequest>

export const scheduleEventsService = {
  list(): Promise<ScheduleEvent[]> {
    return httpService.get<ScheduleEvent[]>('/schedule-events')
  },
  create(payload: CreateScheduleEventRequest): Promise<ScheduleEvent> {
    return httpService.post<ScheduleEvent>('/schedule-events', payload)
  },
  update(id: number, payload: UpdateScheduleEventRequest): Promise<ScheduleEvent> {
    return httpService.put<ScheduleEvent>(`/schedule-events/${id}`, payload)
  },
  remove(id: number): Promise<void> {
    return httpService.delete<void>(`/schedule-events/${id}`)
  },
}
