import { createNativeStackNavigator } from '@react-navigation/native-stack'
import ChatScreen from '../../screens/Chat/ChatScreen'
import ChecklistAddOrEditScreen from '../../screens/Checklist/ChecklistAddOrEditScreen'
import ChecklistScreen from '../../screens/Checklist/ChecklistScreen'

import GroupAddOrEditScreen from '../../screens/Group/GroupAddOrEditScreen'
import GroupListScreen from '../../screens/Group/GroupListScreen'
import HomeScreen from '../../screens/HomeScreen'
import IssueScreen from '../../screens/Issue/Issue'
import IssueAddOrEditScreen from '../../screens/Issue/IssueAddorEditScreen'
import IssueDetailsScreen from '../../screens/Issue/IssueDetailsScreen'
import MilestoneAddOrEditScreen from '../../screens/Milestone/MilestoneAddOrEditScreen'
import MilestoneDetailsScreen from '../../screens/Milestone/MilestoneDetailsScreen'
import MilestoneScreen from '../../screens/Milestone/MilestoneScreen'
import NoteScreen from '../../screens/Note/Note'
import NoteAddOrEditScreen from '../../screens/Note/NoteAddorEditScreen'
import NoteDetailsScreen from '../../screens/Note/NoteDetailsScreen'
import ProjectNoteScreen from '../../screens/Note/ProjectNote'
import ProjectAddOrEditScreen from '../../screens/Project/ProjectAddOrEditScreen'
import ProjectDetailsScreen from '../../screens/Project/ProjectDetailsScreen'
import ProjectScreen from '../../screens/Project/ProjectScreen'
import ProtectedRoute from '../../screens/ProtectedRoute'
import RoleAddOrEditScreen from '../../screens/Role/RoleAddOrEditScreen'
import RoleListScreen from '../../screens/Role/RoleListScreen'
import TaskScreen from '../../screens/Task/Task'
import TaskAddOrEditScreen from '../../screens/Task/TaskAddorEditScreen'
import TaskDetailsScreen from '../../screens/Task/TaskDetailsScreen'
import CompaniesListScreen from '../../screens/User/CompaniesListScreen'
import CompanyAddorEdit from '../../screens/User/CompanyAddorEdit'
import CompanyDetails from '../../screens/User/CompanyDetails'
import SettingsScreen from '../../screens/User/SettingsScreen'
import UserAddScreen from '../../screens/User/UserAddScreen'
import UserListScreen from '../../screens/User/UserListScreen'
import UserProfileUpdateScreen from '../../screens/User/UserProfileUpdateScreen'
import NotificationSettings from '../../screens/UserManagement/NotificationSettings'

import ActivityScreen from '../../screens/Activity/ActivityScreen'
import BudgetAddOrEditScreen from '../../screens/Budget/BudgetAddorEditScreen'
import BudgetDetailsScreen from '../../screens/Budget/BudgetDetailsScreen'
import BudgetItemsScreen from '../../screens/Budget/BudgetItemsScreen'
import BudgetsScreen from '../../screens/Budget/BudgetsScreen'
import ChatCreateGroup from '../../screens/Chat/ChatCreateGroup'
import ChatListScreen from '../../screens/Chat/ChatListScreen'
import ChatMenuScreen from '../../screens/Chat/ChatMenuScreen'
import AddChecklistItemScreen from '../../screens/Checklist/AddChecklistItemScreen'
import ChecklistDetailsScreen from '../../screens/Checklist/ChecklistDetailsScreen'
import ConvertToTaskScreenFromListItem from '../../screens/Checklist/ConvertToTaskScreenFromListItem'
import ClientAddScreen from '../../screens/Client/ClientAddScreen'
import ClientDetailsScreen from '../../screens/Client/ClientDetailsScreen'
import ClientEditScreen from '../../screens/Client/ClientEditScreen'
import ClientListScreen from '../../screens/Client/ClientListScreen'
import DirectoryAddScreen from '../../screens/Directory/DirectoryAdd'
import DirectoryDetailScreen from '../../screens/Directory/DirectoryDetailsScreen'
import DirectoryScreen from '../../screens/Directory/DirectoryScreen'
import ProjectFolders from '../../screens/Files/ProjectFolders'
import IssueMoveScreen from '../../screens/Issue/IssueMove'
import MilestoneMoveScreen from '../../screens/Milestone/MilestoneMove'
import NotificationScreen from '../../screens/Notification/NotificationScreen'
import SearchScreen from '../../screens/Search/Search'
import TaskMoveScreen from '../../screens/Task/TaskMoveScreen'
import TeamAddOrEditScreen from '../../screens/Team/TeamAddOrEditScreen'
import TeamAssignScreen from '../../screens/Team/TeamAssignScreen'
import TeamDetailsScreen from '../../screens/Team/TeamDetailsScreen'
import TeamListScreen from '../../screens/Team/TeamListScreen'
import TimelogAdd from '../../screens/Timelog/TimelogAdd'
import TimelogAddOrEditScreen from '../../screens/Timelog/TimelogAddOrEditScreen'
import TimelogDetailScreen from '../../screens/Timelog/TimelogDetailScreen'
import TimelogsScreen from '../../screens/Timelog/TimelogsScreen'
import TimerScreen from '../../screens/Timelog/TimerScreen'
import UnderConstructionScreen from '../../screens/UnderConstructionScreen'
import AddIPAddressScreen from '../../screens/User/AddIPAddressScreen'
import CompanySecurityScreen from '../../screens/User/CompanySecurityScreen'
import CompanySettingsScreen from '../../screens/User/CompanySettingsScreen'
import MyProfile from '../../screens/User/MyProfile'
import ProjectSettingsScreen from '../../screens/User/ProjectSettingsScreen'
import TimelogLimitsScreen from '../../screens/User/TimelogLimitsScreen'
import UserAssignScreen from '../../screens/User/UserAssignScreen'
import UserDetailsScreen from '../../screens/User/UserDetailsScreen'
import UserEditScreen from '../../screens/User/UserEditScreen'
import MultifactorAuth from '../../screens/UserManagement/MultifactorAuth'
import MultifactorVerificationAccepted from '../../screens/UserManagement/MultifactorVerificationAccepted'
import MultifactorVerifyCode from '../../screens/UserManagement/MultifactorVerifyCode'
import Preferences from '../../screens/UserManagement/Preferences'
import Security from '../../screens/UserManagement/Security'
import CalendarStack from './CalendarStack'
import SubscriptionStack from './SubscriptionStack'
import TimelogEdit from '../../screens/Timelog/TimelogEdit'
import ClientCompanyScreen from '../../screens/Client/ClientCompanyScreen'
import ClientCompanyDetailsScreen from '../../screens/Client/ClientCompanyDetails'
import ClientCompanyAddScreen from '../../screens/Client/ClientCompanyAddScreen'
import SupportListScreen from '../../screens/Support/SupportListScreen'
import TermsOfService from '../../screens/TermsAndPrivacy/TermsOfService'
import SupportCaseAddOrEditScreen from '../../screens/Support/SupportCaseAddOrEditScreen'
import SupportCasePage from '../../screens/Support/SupportCasePage'

const Stack = createNativeStackNavigator()

export default function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName={'Home'}
    >
      <Stack.Screen name="Home" component={HomeScreen} />

      {/* <Stack.Screen name="Projects" component={ProjectScreen} />
      <Stack.Screen name="ProjectDetails" component={ProjectDetailsScreen} />
      <Stack.Screen name="ProjectAdd" component={ProjectAddOrEditScreen} />
      <Stack.Screen name="ProjectEdit" component={ProjectAddOrEditScreen} /> */}

      <Stack.Screen name="Projects">
        {(props) => (
          <ProtectedRoute {...props} permissionKey={['project.index']}>
            <ProjectScreen {...props} />
          </ProtectedRoute>
        )}
      </Stack.Screen>

      <Stack.Screen name="ProjectDetails">
        {(props) => (
          <ProtectedRoute {...props} permissionKey={['project.show']}>
            <ProjectDetailsScreen {...props} />
          </ProtectedRoute>
        )}
      </Stack.Screen>

      <Stack.Screen name="ProjectAdd">
        {(props) => (
          <ProtectedRoute {...props} permissionKey={['project.store']}>
            <ProjectAddOrEditScreen {...props} />
          </ProtectedRoute>
        )}
      </Stack.Screen>

      <Stack.Screen name="ProjectEdit">
        {(props) => (
          <ProtectedRoute {...props} permissionKey={['project.update']}>
            <ProjectAddOrEditScreen {...props} />
          </ProtectedRoute>
        )}
      </Stack.Screen>

      {/* <Stack.Screen name="Milestones" component={MilestoneScreen} />
      <Stack.Screen name="MilestoneDetails" component={MilestoneDetailsScreen} />
      <Stack.Screen name="MilestoneAdd" component={MilestoneAddOrEditScreen} />
      <Stack.Screen name="MilestoneEdit" component={MilestoneAddOrEditScreen} /> */}

      <Stack.Screen name="Milestones">
        {(props) => (
          <ProtectedRoute {...props} permissionKey={['milestone.index']}>
            <MilestoneScreen {...props} />
          </ProtectedRoute>
        )}
      </Stack.Screen>

      <Stack.Screen name="MilestoneAdd">
        {(props) => (
          <ProtectedRoute {...props} permissionKey={['milestone.store']}>
            <MilestoneAddOrEditScreen {...props} />
          </ProtectedRoute>
        )}
      </Stack.Screen>

      <Stack.Screen name="MilestoneEdit">
        {(props) => (
          <ProtectedRoute {...props} permissionKey={['milestone.update']}>
            <MilestoneAddOrEditScreen {...props} />
          </ProtectedRoute>
        )}
      </Stack.Screen>

      <Stack.Screen name="MilestoneMove">
        {(props) => (
          <ProtectedRoute {...props} permissionKey={['milestone.update']}>
            <MilestoneMoveScreen {...props} />
          </ProtectedRoute>
        )}
      </Stack.Screen>

      <Stack.Screen name="MilestoneDetails">
        {(props) => (
          <ProtectedRoute {...props} permissionKey={['milestone.show']}>
            <MilestoneDetailsScreen {...props} />
          </ProtectedRoute>
        )}
      </Stack.Screen>
      {/* 
      <Stack.Screen name="Tasks" component={TaskScreen} />
      <Stack.Screen name="TaskAdd" component={TaskAddOrEditScreen} />
      <Stack.Screen name="TaskEdit" component={TaskAddOrEditScreen} />
      <Stack.Screen name="TaskDetails" component={TaskDetailsScreen} />
      <Stack.Screen name="TaskMove" component={TaskMoveScreen} /> */}

      <Stack.Screen name="Tasks">
        {(props) => (
          <ProtectedRoute {...props} permissionKey={['task.index']}>
            <TaskScreen {...props} />
          </ProtectedRoute>
        )}
      </Stack.Screen>

      <Stack.Screen name="TaskAdd">
        {(props) => (
          <ProtectedRoute {...props} permissionKey={['task.store']}>
            <TaskAddOrEditScreen {...props} />
          </ProtectedRoute>
        )}
      </Stack.Screen>

      <Stack.Screen name="TaskEdit">
        {(props) => (
          <ProtectedRoute {...props} permissionKey={['task.update']}>
            <TaskAddOrEditScreen {...props} />
          </ProtectedRoute>
        )}
      </Stack.Screen>
      <Stack.Screen name="TaskMove">
        {(props) => (
          <ProtectedRoute {...props} permissionKey={['task.update']}>
            <TaskMoveScreen {...props} />
          </ProtectedRoute>
        )}
      </Stack.Screen>

      <Stack.Screen name="TaskDetails">
        {(props) => (
          <ProtectedRoute {...props} permissionKey={['task.show']}>
            <TaskDetailsScreen {...props} />
          </ProtectedRoute>
        )}
      </Stack.Screen>

      {/* <Stack.Screen name="Issues" component={IssueScreen} />
      <Stack.Screen name="IssueAdd" component={IssueAddOrEditScreen} />
      <Stack.Screen name="IssueEdit" component={IssueAddOrEditScreen} />
      <Stack.Screen name="IssueDetails" component={IssueDetailsScreen} /> */}

      <Stack.Screen name="Issues">
        {(props) => (
          <ProtectedRoute {...props} permissionKey={['project.index']}>
            <IssueScreen {...props} />
          </ProtectedRoute>
        )}
      </Stack.Screen>

      <Stack.Screen name="IssueAdd">
        {(props) => (
          <ProtectedRoute {...props} permissionKey={['project.index']}>
            <IssueAddOrEditScreen {...props} />
          </ProtectedRoute>
        )}
      </Stack.Screen>

      <Stack.Screen name="IssueEdit">
        {(props) => (
          <ProtectedRoute {...props} permissionKey={['project.index']}>
            <IssueAddOrEditScreen {...props} />
          </ProtectedRoute>
        )}
      </Stack.Screen>

      <Stack.Screen name="IssueMove">
        {(props) => (
          <ProtectedRoute {...props} permissionKey={['project.index']}>
            <IssueMoveScreen {...props} />
          </ProtectedRoute>
        )}
      </Stack.Screen>

      <Stack.Screen name="IssueDetails">
        {(props) => (
          <ProtectedRoute {...props} permissionKey={['project.index']}>
            <IssueDetailsScreen {...props} />
          </ProtectedRoute>
        )}
      </Stack.Screen>

      {/* <Stack.Screen name="ProjectNote" component={ProjectNoteScreen} />
      <Stack.Screen name="NoteAdd" component={NoteAddOrEditScreen} />
      <Stack.Screen name="NoteDetails" component={NoteDetailsScreen} /> */}

      <Stack.Screen name="ProjectNote">
        {(props) => (
          <ProtectedRoute {...props} permissionKey={['project.index']}>
            <ProjectNoteScreen {...props} />
          </ProtectedRoute>
        )}
      </Stack.Screen>

      <Stack.Screen name="NoteAdd">
        {(props) => (
          <ProtectedRoute {...props} permissionKey={['project.index']}>
            <NoteAddOrEditScreen {...props} />
          </ProtectedRoute>
        )}
      </Stack.Screen>

      <Stack.Screen name="NoteDetails">
        {(props) => (
          <ProtectedRoute {...props} permissionKey={['project.index']}>
            <NoteDetailsScreen {...props} />
          </ProtectedRoute>
        )}
      </Stack.Screen>

      <Stack.Screen name="Companies" component={CompaniesListScreen} />
      <Stack.Screen name="CompanyDetails" component={CompanyDetails} />
      <Stack.Screen name="CompanyAdd" component={CompanyAddorEdit} />
      <Stack.Screen name="CompanyEdit" component={CompanyAddorEdit} />
      <Stack.Screen name="CompanySettings" component={CompanySettingsScreen} />

      {/* <Stack.Screen name="Companies">
        {(props) => (
          <ProtectedRoute {...props} permissionKey={['organization.index']}>
            <CompaniesListScreen {...props} />
          </ProtectedRoute>
        )}
      </Stack.Screen>

      <Stack.Screen name="CompanyDetails">
        {(props) => (
          <ProtectedRoute {...props} permissionKey={['organization.show']}>
            <CompanyDetails {...props} />
          </ProtectedRoute>
        )}
      </Stack.Screen>

      <Stack.Screen name="CompanyAdd">
        {(props) => (
          <ProtectedRoute {...props} permissionKey={['organization.store']}>
            <CompanyAddorEdit {...props} />
          </ProtectedRoute>
        )}
      </Stack.Screen>

      <Stack.Screen name="CompanyEdit">
        {(props) => (
          <ProtectedRoute {...props} permissionKey={['organization.update']}>
            <CompanyAddorEdit {...props} />
          </ProtectedRoute>
        )}
      </Stack.Screen> */}

      <Stack.Screen name="Users">
        {(props) => (
          <ProtectedRoute {...props} permissionKey={['user.show']}>
            <UserListScreen {...props} />
          </ProtectedRoute>
        )}
      </Stack.Screen>

      <Stack.Screen name="UserAdd">
        {(props) => (
          <ProtectedRoute {...props} permissionKey={['user.sendInvitation']}>
            <UserAddScreen {...props} />
          </ProtectedRoute>
        )}
      </Stack.Screen>

      {/* <Stack.Screen name="Users" component={UserListScreen} />
      <Stack.Screen name="UserAdd" component={UserAddScreen} /> */}
      {/* 
      <Stack.Screen name="RoleAdd" component={RoleAddOrEditScreen} />
      <Stack.Screen name="RoleEdit" component={RoleAddOrEditScreen} />
      <Stack.Screen name="Roles" component={RoleListScreen} /> */}

      <Stack.Screen name="RoleAdd">
        {(props) => (
          <ProtectedRoute {...props} permissionKey={['role.store']}>
            <RoleAddOrEditScreen {...props} />
          </ProtectedRoute>
        )}
      </Stack.Screen>

      <Stack.Screen name="RoleEdit">
        {(props) => (
          <ProtectedRoute {...props} permissionKey={['role.update']}>
            <RoleAddOrEditScreen {...props} />
          </ProtectedRoute>
        )}
      </Stack.Screen>

      <Stack.Screen name="Roles">
        {(props) => (
          <ProtectedRoute {...props} permissionKey={['role.index']}>
            <RoleListScreen {...props} />
          </ProtectedRoute>
        )}
      </Stack.Screen>

      <Stack.Screen name="Search" component={SearchScreen} />

      <Stack.Screen name="UserProfileUpdateScreen" component={UserProfileUpdateScreen} />
      <Stack.Screen name="MyProfile" component={MyProfile} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Security" component={Security} />
      <Stack.Screen name="MultifactorVerifyCode" component={MultifactorVerifyCode} />
      <Stack.Screen name="MultifactorAuth" component={MultifactorAuth} />
      <Stack.Screen
        name="MultifactorVerificationAccepted"
        component={MultifactorVerificationAccepted}
      />
      <Stack.Screen name="Preferences" component={Preferences} />
      <Stack.Screen name="NotificationSettings" component={NotificationSettings} />
      <Stack.Screen name="Notes" component={NoteScreen} />

      <Stack.Screen name="ProjectFolders" component={ProjectFolders} />

      <Stack.Screen name="Groups" component={GroupListScreen} />
      <Stack.Screen name="GroupAdd" component={GroupAddOrEditScreen} />
      <Stack.Screen name="GroupEdit" component={GroupAddOrEditScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />

      <Stack.Screen name="Checklist" component={ChecklistScreen} />
      <Stack.Screen name="ChecklistAdd" component={ChecklistAddOrEditScreen} />
      <Stack.Screen name="ChecklistEdit" component={ChecklistAddOrEditScreen} />
      <Stack.Screen name="ChecklistDetails" component={ChecklistDetailsScreen} />
      <Stack.Screen name="AddChecklistItem" component={AddChecklistItemScreen} />
      <Stack.Screen name="ConvertToTaskFromListItem" component={ConvertToTaskScreenFromListItem} />
      {/* <Stack.Screen name="Items" component={ItemsScreen} />
      <Stack.Screen name="ItemAdd" component={ItemAddOrEditScreen} />
      <Stack.Screen name="ItemEdit" component={ItemAddOrEditScreen} />
      <Stack.Screen name="ItemDetails" component={ItemDetailsScreen} /> */}
      <Stack.Screen name="Subscriptions" component={SubscriptionStack} />
      <Stack.Screen name="Calendar" component={CalendarStack} />
      {/* <Stack.Screen name="CustomizePlan" component={CustomizePlanScreen} /> */}

      {/* Timelogs screen || need to be protected later*/}

      <Stack.Screen name="Timelogs" component={TimelogsScreen} />
      <Stack.Screen name="TimelogAdd" component={TimelogAdd} />
      <Stack.Screen name="TimelogEdit" component={TimelogEdit} />
      <Stack.Screen name="TimelogDetail" component={TimelogDetailScreen} />
      <Stack.Screen name="Timer" component={TimerScreen} />
      {/* Budget screens  */}
      <Stack.Screen name="Budgets" component={BudgetsScreen} />
      <Stack.Screen name="BudgetItems" component={BudgetItemsScreen} />
      <Stack.Screen name="BudgetDetails" component={BudgetDetailsScreen} />
      <Stack.Screen name="BudgetAdd" component={BudgetAddOrEditScreen} />

      {/* Company Management */}
      <Stack.Screen name="CompanySecurityScreen" component={CompanySecurityScreen} />
      <Stack.Screen name="AddIPAddressScreen" component={AddIPAddressScreen} />
      <Stack.Screen name="TimelogLimitsScreen" component={TimelogLimitsScreen} />
      <Stack.Screen name="ProjectSettingsScreen" component={ProjectSettingsScreen} />
      <Stack.Screen name="DirectoryScreen" component={DirectoryScreen} />
      <Stack.Screen name="DirectoryDetail" component={DirectoryDetailScreen} />
      <Stack.Screen name="DirectoryAdd" component={DirectoryAddScreen} />
      <Stack.Screen name="UserDetailsScreen" component={UserDetailsScreen} />

      {/* Undercontruction */}
      <Stack.Screen name="Underconstruction" component={UnderConstructionScreen} />

      {/* Undercontruction */}
      <Stack.Screen name="Notifications" component={NotificationScreen} />
      <Stack.Screen name="ChatListScreen" component={ChatListScreen} />
      <Stack.Screen name="ChatMenuScreen" component={ChatMenuScreen} />
      <Stack.Screen name="ChatCreateGroup" component={ChatCreateGroup} />
      <Stack.Screen name="Activity" component={ActivityScreen} />
      {/* 
      <Stack.Screen name="YearView" component={YearView} />
      <Stack.Screen name="DayView" component={DayView} />
      <Stack.Screen name="MonthView" component={MonthView} />
      <Stack.Screen name="WeekView" component={WeekView} /> */}

      <Stack.Screen name="ClientListScreen" component={ClientListScreen} />
      <Stack.Screen name="ClientDetails" component={ClientDetailsScreen} />
      <Stack.Screen name="ClientAddScreen" component={ClientAddScreen} />
      <Stack.Screen name="ClientEditScreen" component={ClientEditScreen} />
      <Stack.Screen name="ClientCompanyScreen" component={ClientCompanyScreen} />
      <Stack.Screen name="ClientCompanyDetailsScreen" component={ClientCompanyDetailsScreen} />
      <Stack.Screen name="ClientCompanyAddScreen" component={ClientCompanyAddScreen} />
      <Stack.Screen name="ClientCompanyEdit" component={ClientCompanyAddScreen} />
      <Stack.Screen name="UserEditScreen" component={UserEditScreen} />
      <Stack.Screen name="UserAssignScreen" component={UserAssignScreen} />

      <Stack.Screen name="Teams" component={TeamListScreen} />
      <Stack.Screen name="TeamDetailsScreen" component={TeamDetailsScreen} />
      <Stack.Screen name="TeamAddOrEditScreen" component={TeamAddOrEditScreen} />
      <Stack.Screen name="TeamAssignScreen" component={TeamAssignScreen} />

      <Stack.Screen name="TermsScreen" component={TermsOfService} />

      <Stack.Screen name="SupportListScreen" component={SupportListScreen} />
      <Stack.Screen name="CreateSupportCase" component={SupportCaseAddOrEditScreen} />
      <Stack.Screen name="SupportCasePage" component={SupportCasePage} />
    </Stack.Navigator>
  )
}
