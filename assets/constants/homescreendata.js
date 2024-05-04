import FilesIcon from '../svg/BigFile.svg'
import { default as ClientCompaniesIcon, default as CompaniesIcon } from '../svg/Company.svg'
import ChatsIcon from '../svg/chats.svg'
import ClientsIcon from '../svg/customers.svg'
import DirectoryIcon from '../svg/directory.svg'
import ExpensesIcon from '../svg/expenses.svg'
import GranttIcon from '../svg/grantt.svg'
import TeamsIcon from '../svg/groups.svg'
import IssuesIcon from '../svg/issues.svg'
import ListsIcon from '../svg/list-home.svg'
import MilestonesIcon from '../svg/milestone.svg'
import NotesIcon from '../svg/notes.svg'
import NotificationsIcon from '../svg/notifications.svg'
import ProductivityIcon from '../svg/productivity.svg'
import ProjectsIcon from '../svg/projects.svg'
import RolesIcon, { default as CardsIcon } from '../svg/roles.svg'
import TasksIcon from '../svg/tasks.svg'
import TimelogsIcon from '../svg/timelogs.svg'
import { default as BudgetsIcon, default as EmployeesIcon } from '../svg/users.svg'
export const homeMenu = [
  {
    id: 1,
    key: 1,
    deletedMenu: false,
    label: 'Projects',
    Icon: ProjectsIcon,
    navigateDestination: 'Projects',
  },
  {
    id: 2,
    key: 2,
    deletedMenu: false,
    label: 'Notifications',
    Icon: NotificationsIcon,
    navigateDestination: 'Notifications',
  },
  {
    id: 3,
    key: 3,
    deletedMenu: false,
    label: 'Chats',
    Icon: ChatsIcon,
    navigateDestination: 'ChatListScreen',
  },
  {
    id: 4,
    key: 4,
    deletedMenu: false,
    label: 'Timelogs',
    Icon: TimelogsIcon,
    navigateDestination: 'Timelogs',
  },
  {
    id: 5,
    key: 5,
    deletedMenu: false,
    label: 'Tasks',
    Icon: TasksIcon,
    navigateDestination: 'Tasks',
    navigateDestinationParams: {
      allData: true,
    },
  },
  {
    id: 6,
    key: 6,
    deletedMenu: false,
    label: 'Issues',
    Icon: IssuesIcon,
    navigateDestination: 'Issues',
    navigateDestinationParams: {
      allData: true,
      fromHome: true,
    },
  },

  {
    id: 7,
    key: 7,
    deletedMenu: false,
    label: 'Milestones',
    Icon: MilestonesIcon,
    navigateDestination: 'Milestones',
    navigateDestinationParams: {
      allData: true,
      fromHome: true,
    },
  },

  // {
  //   id: 7,
  //   key: 7,
  //   deletedMenu: false,
  //   label: 'Finance',
  //   Icon: FinanceIcon,
  //   navigateDestination: 'HomeStack',
  //   menuType: 'Finance',
  // },
  // {
  //   id: 8,
  //   key: 8,
  //   deletedMenu: false,
  //   label: 'Reports',
  //   Icon: ReportsIcon,
  //   navigateDestination: '',
  //   menuType: 'Reports',
  // },
  {
    id: 9,
    key: 9,
    deletedMenu: false,
    label: 'Directory',
    Icon: DirectoryIcon,
    navigateDestination: '',
    menuType: 'Directory',
  },
  {
    id: 10,
    key: 10,
    deletedMenu: false,
    label: 'Notes',
    Icon: NotesIcon,
    navigateDestination: 'Notes',
    menuType: '',
    navigateDestinationParams: {
      allData: true,
    },
  },
  {
    id: 11,
    key: 11,
    deletedMenu: false,
    label: 'Files',
    Icon: FilesIcon,
    navigateDestination: 'ProjectFolders',
    menuType: '',
    navigateDestinationParams: {
      allData: true,
    },
  },
  {
    id: 13,
    key: 13,
    deletedMenu: false,
    label: 'Lists',
    Icon: ListsIcon,
    navigateDestination: 'Checklist',
    navigateDestinationParams: {
      allData: true,
      fromHome: true,
    },
  },

  {
    id: 12,
    key: 12,
    deletedMenu: false,
    label: 'Companies',
    Icon: CompaniesIcon,
    navigateDestination: 'Companies',
  },
]

export const financeMenu = [
  {
    id: 12,
    key: 12,
    deletedMenu: false,
    label: 'Budgets',
    Icon: BudgetsIcon,
    navigateDestination: 'Budgets',
  },
  {
    id: 13,
    key: 13,
    deletedMenu: false,
    label: 'Expenses',
    Icon: ExpensesIcon,
    navigateDestination: '',
  },
  {
    id: 14,
    key: 14,
    deletedMenu: false,
    label: 'Cards',
    Icon: CardsIcon,
    navigateDestination: '',
  },
]

export const reportMenu = [
  {
    id: 18,
    key: 18,
    label: 'Timelog',
    deletedMenu: false,
    Icon: TimelogsIcon,
    navigateDestination: '',
  },
  {
    id: 19,
    key: 19,
    deletedMenu: false,
    label: 'Productivity',
    Icon: ProductivityIcon,
    navigateDestination: '',
  },
  {
    id: 20,
    key: 20,
    deletedMenu: false,
    label: 'Expenses',
    Icon: ExpensesIcon,
    navigateDestination: '',
  },
  {
    id: 21,
    key: 21,
    deletedMenu: false,
    label: 'Grantt',
    Icon: GranttIcon,
    navigateDestination: '',
  },
]

export let directoryMenu = [
  {
    id: 22,
    key: 22,
    deletedMenu: false,
    label: 'Employees',
    Icon: EmployeesIcon,
    navigateDestination: 'Users',
  },

  {
    id: 23,
    key: 23,
    deletedMenu: false,
    label: 'Roles',
    Icon: RolesIcon,
    navigateDestination: 'Roles',
  },
  // {
  //   id: 23,
  //   key: 23,
  //   deletedMenu: false,
  //   label: 'Teams',
  //   Icon: TeamsIcon,
  //   navigateDestination: '',
  // },

  {
    id: 24,
    key: 24,
    deletedMenu: false,
    label: 'Teams',
    Icon: TeamsIcon,
    navigateDestination: 'Teams',
  },
  {
    id: 25,
    key: 25,
    deletedMenu: false,
    label: 'Clients',
    Icon: ClientsIcon,
    navigateDestination: 'ClientListScreen',
  },
  // {
  //   id: 25,
  //   key: 25,
  //   deletedMenu: false,
  //   label: 'Vendors',
  //   Icon: VendorsIcon,
  //   navigateDestination: '',
  // },

  {
    id: 26,
    key: 26,
    deletedMenu: false,
    label: 'Client Companies',
    Icon: ClientCompaniesIcon,
    navigateDestination: 'ClientCompanyScreen',
  },
]
