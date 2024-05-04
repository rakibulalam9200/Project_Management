import colors from './colors'

export default [
  {
    value: 'in_progress',
    label: 'In Progress',
    color: colors.IN_PROGRESS_BG,
  },

  {
    value: 'on_hold',
    label: 'On Hold',
    color: colors.ON_HOLD_BG,
  },
  {
    value: 'past_due',
    label: 'Past Due',
    color: colors.PAST_DUE_BG,
  },
  {
    value: 'new',
    label: 'New',
    color: colors.NEW_BG,
  },
  {
    value: 'completed',
    label: 'Completed',
    color: colors.COMPLETED_BG,
  },
  {
    value: 'review',
    label: 'Review',
    color: colors.REVIEW_BG,
  },
  {
    value: 'issue',
    label: 'Issue',
    color: colors.ON_HOLD_BG,
  },
]

export const listFilters = [
  {
    value: 'Complete',
    label: 'Completed',
    color: colors.GREY,
  },

  {
    value: 'Opened',
    label: 'Open',
    color: colors.GREEN_NORMAL,
  },
]

export const TimelogColor = {
  Draft: {
    color: colors.HEADER_TEXT,
  },
  Submitted: {
    color: colors.Focused_TAB,
  },
  Declined: {
    color: colors.RED_NORMAL,
  },
  Approved: {
    color: colors.GREEN_NORMAL,
  },
}

export const ListFilterColors = {
  Complete: {
    color: colors.GREY,
  },
  Opened: {
    color: colors.GREEN_NORMAL,
  },
}

export const SupportStatus = {
  close: {
    color: colors.GREY,
  },
  Open: {
    color: colors.GREEN_NORMAL,
  },
  pending: {
    color: colors.GREY,
  },
}

export const FilterColors = {
  'In Progress': {
    color: colors.IN_PROGRESS_BG,
  },
  New: {
    color: colors.NEW_BG,
  },
  Completed: {
    color: colors.COMPLETED_BG,
  },
  Review: {
    color: colors.REVIEW_BG,
  },
  'On Hold': {
    color: colors.ON_HOLD_BG,
  },
  'Past Due': {
    color: colors.PAST_DUE_BG,
  },
  Issue: {
    color: colors.ON_HOLD_BG,
  },
}

export const PriorityColors = {
  medium: {
    color: colors.GREEN_NORMAL,
  },
  high: {
    color: colors.RED_NORMAL,
  },
  low: {
    color: colors.NEW_BG,
  },
}

export const Priorities = [
  {
    value: 'high',
    label: 'High',
    color: colors.RED_NORMAL,
  },
  {
    value: 'medium',
    label: 'Medium',
    color: colors.GREEN_NORMAL,
  },
  {
    value: 'low',
    label: 'Low',
    color: colors.NEW_BG,
  },
]
