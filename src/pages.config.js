/**
 * pages.config.js - Page routing configuration
 */
import HomeBaseManual from './pages/HomeBaseManual';
import HomeBase from './pages/HomeBase';
import Onboarding from './pages/Onboarding';
import Projects from './pages/Projects';
import Insights from './pages/Insights';
import Integrations from './pages/Integrations';
import ContactsAccounts from './pages/ContactsAccounts';
import Admin from './pages/Admin';
import AskAI from './pages/AskAI';
import __Layout from './Layout.jsx';


export const PAGES = {
    "HomeBaseManual": HomeBaseManual,
    "HomeBase": HomeBase,
    "Onboarding": Onboarding,
    "Projects": Projects,
    "Insights": Insights,
    "Integrations": Integrations,
    "ContactsAccounts": ContactsAccounts,
    "Admin": Admin,
    "AskAI": AskAI,
}

export const pagesConfig = {
    mainPage: "HomeBase",
    Pages: PAGES,
    Layout: __Layout,
};
