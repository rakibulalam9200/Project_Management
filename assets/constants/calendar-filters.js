import colors from './colors'

export default [
  {
    value: 'in_progress',
    label: 'In Progress',
    color: colors.IN_PROGRESS_BG,
  },
  {
    value: 'review',
    label: 'Review',
    color: colors.REVIEW_BG,
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
    value: 'past_due',
    label: 'Past Due',
    color: colors.PAST_DUE_BG,
  },


]

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
}

export const PriorityColors = {
  'medium': {
    color: colors.GREEN_NORMAL,
  },
  high: {
    color: colors.RED_NORMAL,
  },
  low: {
    color: colors.NEW_BG,
  },

}


export const showTypes = [
  {
    id: 1,
    name: 'All',
    value: 'All',
  },
  {
    id: 2,
    name: 'Projects',
    value: 'Project',
  },
  {
    id: 3,
    name: 'Milestones',
    value: 'Milestone',
  },
  {
    id: 4,
    name: 'Tasks',
    value: 'Task',
  },
  {
    id: 5,
    name: 'Issue',
    value: 'Issue',
  },
  {
    id: 6,
    name: 'Event',
    value: 'Event',
  },
]


export const stateAndNavigationDestination = {
  'Project': 'ProjectDetails',
  'Task': 'TaskDetails',
  'Issue': 'IssueDetails',
  'Milestone': 'MilestoneDetails',
  'Event': 'EventDetails',
}
