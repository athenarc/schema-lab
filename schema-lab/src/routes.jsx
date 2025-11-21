import React, { useContext } from "react";
import { Navigate, Outlet, Route, createBrowserRouter, createRoutesFromElements } from "react-router-dom";
import Home from "./Home";
import Auth from "./auth";
import Logout from "./auth/Logout";
import Dashboard from "./dashboard";
import Files from "./files";
import Base from "./layouts/Base";
import { UserDetailsContext } from "./utils/components/auth/AuthProvider";
import UserPreferencesView from "./client/ClientPreferencesView";
import Details from "./dashboard/tasks/details";
import Executors from "./dashboard/tasks/details/Executors";
import Outputs from "./dashboard/tasks/details/Outputs"
import Inputs from "./dashboard/tasks/details/Inputs"
import RunTask from "./runtask";
import RunWorkflowTask from "./runworkflowtask";
import AboutusTemplate from './layouts/Aboutus_template';
// import Aboutus from "./layouts/Aboutus";
import LearnMore from "./layouts/LearnMore";
import SelectTask from "./dashboard/tasks/expriment/create";
import Experiments from "./dashboard/tasks/expriment"
import Experiment from "./dashboard/tasks/expriment/view"
import ViewExperiments from "./dashboard/tasks/expriment/preview/index"
import ExperimentListDetails from "./dashboard/tasks/expriment/details";
import ExperimentDetails from "./dashboard/tasks/expriment/details/ExperimentDetails";
import EditExperiment from "./dashboard/tasks/expriment/edit";
import ExportExperiment from "./dashboard/tasks/expriment/export";

const ProtectedRoutes = () => {
    const { userDetails } = useContext(UserDetailsContext);
    if (userDetails) {
        return <Outlet />;
    }
    else {
        return <Navigate to={"/auth"} />;
    }
}

const router = createBrowserRouter(
    createRoutesFromElements(
        <Route element={<Base />}>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            {/* To render the customized AboutUs page, modify element class from AboutusTemplate to Aboutus */}
            <Route path="/aboutus" element={<AboutusTemplate />} />
            <Route path="/learnmore" element={<LearnMore />} />
            <Route element={<ProtectedRoutes />}>
                <Route path="/logout" element={<Logout />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/runtask" element={<RunTask />} />
                <Route path="/runworkflowtask" element={<RunWorkflowTask />} />
                <Route path="/preferences" element={<UserPreferencesView />} />
                <Route path="/experiment" element={<Experiments/>} />
                    <Route path="/view" element={<Experiment/>} />
                    <Route path="/create" element={<SelectTask/>} />
                    <Route path="/preview" element={<ViewExperiments/>} />
                    <Route path="/export/:creator/:name" element={<ExportExperiment/>} />
                    <Route path="/edit/:creator/:name" element={<EditExperiment/>} />
                <Route path="/experiment-details/:creator/:name" element={<ExperimentListDetails />}>
                    <Route index element={<Navigate to="description" />} />
                    <Route path="description" element={<ExperimentDetails />} />
                </Route>
                <Route path="/files" element={<Files/>} />
                <Route path="/task-details/:uuid" element={<Details />}>
                    <Route index element={<Navigate to="executors" />} />
                    <Route path="executors" element={<Executors />} />
                    <Route path="inputs" element={<Inputs />} />
                    <Route path="outputs" element={<Outputs />} />
                </Route>
            </Route>
            <Route path="/*" element={<Navigate to={"/"} />} />
        </Route>
    )
);

export default router;