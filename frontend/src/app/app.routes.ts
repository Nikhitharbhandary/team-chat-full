import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { OrganizationComponent } from './components/organization/organization.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { HeaderComponent } from './components/header/header.component';
import { PeopleComponent } from './components/people/people.component';
import { ChannelComponent } from './components/channel/channel.component';

import { UserregisterComponent } from './components/user/userregister/userregister.component';
import { UserloginComponent } from './components/user/userlogin/userlogin.component';
import { UsermanageComponent } from './components/usermanage/usermanage.component';
import { EditUserComponent } from './components/edit-user/edit-user.component';
import { UserdashboardComponent } from './components/user/userdashboard/userdashboard.component';
import { UsersidebarComponent } from './components/user/usersidebar/usersidebar.component';
import { UserheaderComponent } from './components/user/userheader/userheader.component';
import { UserchatComponent } from './components/user/userchat/userchat.component';
import { AdminchatComponent } from './components/adminchat/adminchat.component';
import { FetchchannelComponent } from './components/fetchchannel/fetchchannel.component';
import { ViewChannelComponent } from './components/view-channel/view-channel.component';
import { AdmindmComponent } from './components/admindm/admindm.component';
import { FetchUserComponent } from './components/fetch-user/fetch-user.component';
import { UserdmComponent } from './components/user/userdm/userdm.component';
import { SettingComponent } from './components/setting/setting.component';
import { ForgotpasswordComponent } from './components/forgotpassword/forgotpassword.component';
import { UfpComponent } from './components/user/ufp/ufp.component';
import { FetchuserchannelComponent } from './components/user/fetchuserchannel/fetchuserchannel.component';


export const routes: Routes = [
   
    
    {
        path: '',
        component: HomeComponent
    },
    {
        path:'admin',
        children:[
    
    {
        path: 'organization',
        component:OrganizationComponent
    },
    {
        path: 'login',
        component:LoginComponent
    },
    {
        path: 'forgotpassword',
        component:ForgotpasswordComponent
    },
    {
        path: 'register',
        component:RegisterComponent
    },
    {
        path:'dashboard',
        component:DashboardComponent
    },
    {
        path:'header',
        component:HeaderComponent
    },
    {
        path:'sidebar',
        component:SidebarComponent
    },
    { path:'channel',
        component: ChannelComponent

    },
{
    path:'people',
    component:PeopleComponent
},
{
    path:'usermanage',
    component:UsermanageComponent
},
{
    path:'edit-user/:id',
    component:EditUserComponent
},

{
    path:'adminchat',
    component:AdminchatComponent
},
{
    path:'fetchchannel',
    component:FetchchannelComponent
},
{
    path:'view_channel',
    component:ViewChannelComponent
},
{
    path:'admindm',
    component:AdmindmComponent
},
{
    path:'fetch_user',
    component:FetchUserComponent
},
{
    path:'setting',
    component:SettingComponent
}

]

},

{
    path:'user',
    children:[

{ 
    path:'userregister',
    component:UserregisterComponent
},
{
    path:'userlogin',
    component:UserloginComponent
},
{
    path:'ufp',
    component:UfpComponent
},
{
    path:'userdashboard',
    component:UserdashboardComponent
},
{
    path:'usersidebar',
    component:UsersidebarComponent
},
{
    path:'userheader',
    component:UserheaderComponent
},
{
    path:'userchat',
    component:UserchatComponent
},
{
    path:'userdm',
    component:UserdmComponent
},
{
    path:'ufetchc',
    component:FetchuserchannelComponent
}
]

}
];
