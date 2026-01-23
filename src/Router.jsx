import Auth from './page/Login/Auth'
import { Toaster } from 'sonner';
import FirstTimeWelcome from './page/FirstTimeWelcome/FirstTimeWelcome'
import { Onboarding } from './page/Onboarding/Onboarding';
import OnboardingSuccess from './page/OnboardingSuccess/OnboardingSuccess';
import WelcomeModal from './components/ui/WelcomeModel/WelcomeModal';
import AppSidebar from './components/ui/AppSidebar/AppSidebar';
import Dashboard from './page/DashBoard/DashBoard';
import Accounts from './page/Accounts/Accounts';
import Transactions from './page/Transactions/Transactions';
import FinanceProductCard from './components/ui/FinanceProductCard/FinanceProductCard';
import Credits from './page/Credits/Credits';
import Deposits from './page/Deposits/Deposits';

export default function Router() {
    return (
        <>
            {/* <Auth />
            <Toaster/> */}
            {/* <FirstTimeWelcome /> */}
            {/* <Onboarding/> */}
            {/* <OnboardingSuccess userName="Анна" onContinue={() => {}} /> */}
            {/* <WelcomeModal userName="Анна" onClose={() => {}} /> */}
            {/* <AppSidebar currentPage="dashboard" onNavigate={(page) => { console.log('Navigate to', page); }} /> */}
            {/* <Dashboard currentPage="dashboard"/> */}
            {/* <Accounts /> */}
            {/* <Transactions /> */}
            {/* <Credits /> */}
            <Deposits />
            <Toaster />

        </>
    )
}