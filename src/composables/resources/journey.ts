/**
 * Journey (git-graph parcours) admin resources:
 *   • tracks   — CRUD, bound by slug (`/admin/journey-tracks`)
 *   • milestones — CRUD by id, `index({ track_id })` to scope to a branch
 *   • section  — singleton config (`/admin/journey-section`)
 *   • milestone ↔ technology pivot — replace the whole set in one call.
 */
import { api } from '@/api/client'
import { defineCrudResource } from '@/composables/useCrudResource'
import { defineSingletonResource } from '@/composables/useSingletonResource'
import type {
  JourneyMilestone,
  JourneyMilestoneInput,
  JourneySection,
  JourneySectionInput,
  JourneyTrack,
  JourneyTrackInput,
  Technology,
} from '@/api/types'

export const useJourneyTracks = defineCrudResource<JourneyTrack, JourneyTrackInput>({
  resource: 'journey-tracks',
})

export const useJourneyMilestones = defineCrudResource<JourneyMilestone, JourneyMilestoneInput>({
  resource: 'journey-milestones',
})

export const useJourneySection = defineSingletonResource<JourneySection, JourneySectionInput>(
  'journey-section',
)

/** PUT /admin/journey-milestones/{id}/technologies — replace the whole set. */
export function syncMilestoneTechnologies(
  milestoneId: number,
  technologyIds: number[],
): Promise<Technology[]> {
  return api.put<Technology[]>(`/admin/journey-milestones/${milestoneId}/technologies`, {
    technology_ids: technologyIds,
  })
}
