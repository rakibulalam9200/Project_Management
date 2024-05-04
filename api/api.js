import axios from '../plugins/axios'
import Activity from './Activity'
import Assign from './Assign'
import Auth from './Auth'
import Calendar from './Calendar'
import Chat from './Chat'
import Checklist from './Checklist'
import Client from './Client'
import ClientCompany from './ClientCompany'
import Company from './Company'
import Completion from './Completion'
import Country from './Country'
import DashboardListView from './DashboardListView'
import DateFormat from './DateFormat'
import FileManagement from './FileManagement'
import FilterHistory from './FilterHistory'
import GlobalSearch from './GlobalSearch'
import Group from './Group'
import Milestone from './Milestone'
import Note from './Note'
import Notification from './Notification'
import Project from './Project'
import Role from './Role'
import Subscription from './Subscription'
import SupportCase from './SupportCase'
import Task from './Task'
import Team from './Team'
import Template from './Template'
import TimeTracking from './TimeTracking'
import Timelog from './Timelog'
import Timezone from './Timezone'
import User from './User'
import WorkingHour from './WorkingHour'
import Issue from './issue'

export default {
  auth: new Auth(axios),
  company: new Company(axios),
  project: new Project(axios),
  milestone: new Milestone(axios),
  task: new Task(axios),
  user: new User(axios),
  issue: new Issue(axios),
  note: new Note(axios),
  role: new Role(axios),
  timezone: new Timezone(axios),
  group: new Group(axios),
  template: new Template(axios),
  subscription: new Subscription(axios),
  chat: new Chat(axios),
  dateFormat: new DateFormat(axios),
  fileManagement: new FileManagement(axios),
  checklist: new Checklist(axios),
  timelog: new Timelog(axios),
  completion: new Completion(axios),
  country: new Country(axios),
  workingHour: new WorkingHour(axios),
  calendar: new Calendar(axios),
  filterHistory: new FilterHistory(axios),
  dashboardListView: new DashboardListView(axios),
  notification: new Notification(axios),
  timeTracking: new TimeTracking(axios),
  team: new Team(axios),
  globalsearch: new GlobalSearch(axios),
  activity: new Activity(axios),
  client: new Client(axios),
  clientCompany: new ClientCompany(axios),
  assign: new Assign(axios),
  supportCase: new SupportCase(axios),
}
