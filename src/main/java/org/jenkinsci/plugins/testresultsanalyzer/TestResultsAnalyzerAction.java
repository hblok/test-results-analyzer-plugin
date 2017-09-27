package org.jenkinsci.plugins.testresultsanalyzer;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.logging.Logger;

//import org.apache.log4j.Logger;
import org.jenkinsci.plugins.testresultsanalyzer.config.UserConfig;
import org.jenkinsci.plugins.testresultsanalyzer.result.info.JsonTestResults;
import org.jenkinsci.plugins.testresultsanalyzer.result.info.ResultInfo;
import org.kohsuke.stapler.bind.JavaScriptMethod;

import hudson.model.Action;
import hudson.model.Actionable;
import hudson.model.Item;
import hudson.model.Job;
import hudson.model.Run;
import hudson.tasks.test.AbstractTestResultAction;
import hudson.tasks.test.AggregatedTestResultAction;
import hudson.tasks.test.TabulatedResult;
import hudson.tasks.test.TestResult;
import hudson.util.RunList;
import jenkins.model.Jenkins;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

public class TestResultsAnalyzerAction extends Actionable implements Action {

    @SuppressWarnings("rawtypes")
    Job project;
    private List<Integer> builds = new ArrayList<Integer>();
    //private final static Logger LOG = Logger.getLogger(TestResultsAnalyzerAction.class.getName());
    private static Logger LOG = Logger.getLogger(TestResultsAnalyzerAction.class.getName());

    ResultInfo resultInfo;

    public TestResultsAnalyzerAction(@SuppressWarnings("rawtypes") Job project) {
        this.project = project;
    }

    /**
     * The display name for the action.
     *
     * @return the name as String
     */
    public final String getDisplayName() {
        return this.hasPermission() ? Constants.NAME : null;
    }

    /**
     * The icon for this action.
     *
     * @return the icon file as String
     */
    public final String getIconFileName() {
        return this.hasPermission() ? Constants.ICONFILENAME : null;
    }

    /**
     * The url for this action.
     *
     * @return the url as String
     */
    public String getUrlName() {
        return this.hasPermission() ? Constants.URL : null;
    }

    /**
     * Search url for this action.
     *
     * @return the url as String
     */
    public String getSearchUrl() {
        return this.hasPermission() ? Constants.URL : null;
    }

    /**
     * Checks if the user has CONFIGURE permission.
     *
     * @return true - user has permission, false - no permission.
     */
    private boolean hasPermission() {
        return project.hasPermission(Item.READ);
    }

    @SuppressWarnings("rawtypes")
    public Job getProject() {
        return this.project;
    }

    @JavaScriptMethod
    public JSONArray getNoOfBuilds(String noOfbuildsNeeded) {
        JSONArray jsonArray;
        int noOfBuilds = getNoOfBuildRequired(noOfbuildsNeeded);

        jsonArray = getBuildsArray(getBuildList(noOfBuilds));

        return jsonArray;
    }

    private JSONArray getBuildsArray(List<Integer> buildList) {
        JSONArray jsonArray = new JSONArray();
        for (Integer build : buildList) {
            jsonArray.add(build);
        }
        return jsonArray;
    }

    private List<Integer> getBuildList(int noOfBuilds) {
        if ((noOfBuilds <= 0) || (noOfBuilds >= builds.size())) {
            return builds;
        }

        List<Integer> buildList = new ArrayList<Integer>();

        for(int i = 0; i < noOfBuilds; i++) {
            buildList.add(builds.get(i));
        }

        return buildList;
    }

    private int getNoOfBuildRequired(String noOfbuildsNeeded) {
        int noOfBuilds;
        try {
            noOfBuilds = Integer.parseInt(noOfbuildsNeeded);
        }
        catch (NumberFormatException e) {
            noOfBuilds = -1;
        }
        return noOfBuilds;
    }

    public boolean isUpdated() {
        Run<?, ?> lastBuild = project.getLastBuild();
        if (lastBuild == null) {
            return false;
        }

        int latestBuildNumber = lastBuild.getNumber();
        return !(builds.contains(latestBuildNumber));
    }

    @SuppressWarnings({"rawtypes", "unchecked"})
    public void getJsonLoadData() {
        if (!isUpdated()) {
            LOG.info("Build info is up to date");
            return;
        }

        LOG.info("Read new build info");

        resultInfo = new ResultInfo();
        builds = new ArrayList<Integer>();

        RunList<Run> runs = project.getBuilds();
        for (Run run : runs) {
            if(run.isBuilding()) {
                continue;
            }

            int buildNumber = run.getNumber();
            builds.add(buildNumber);

            LOG.info("Reading build " + buildNumber);

            List<AbstractTestResultAction> testActions = run.getActions(AbstractTestResultAction.class);
            for (AbstractTestResultAction testAction : testActions) {
                if (AggregatedTestResultAction.class.isInstance(testAction)) {
                    addTestResults(buildNumber, (AggregatedTestResultAction) testAction);
                } else {
                    addTestResult(buildNumber, run, testAction, testAction.getResult());
                }
            }
        }
    }

    private void addTestResults(int buildNumber, AggregatedTestResultAction testAction) {
        List<AggregatedTestResultAction.ChildReport> childReports = testAction.getChildReports();
        for (AggregatedTestResultAction.ChildReport childReport : childReports) {
            addTestResult(buildNumber, childReport.run, testAction, childReport.result);
        }
    }

    private void addTestResult(int buildNumber, Run<?, ?> run, AbstractTestResultAction<?> testAction, Object result) {
        if (run == null || result == null) {
            return;
        }

        try {
            TabulatedResult testResult = (TabulatedResult) result;
            Collection<? extends TestResult> packageResults = testResult.getChildren();
            for (TestResult packageResult : packageResults) { // packageresult
                resultInfo.addPackage(buildNumber, (TabulatedResult) packageResult, Jenkins.getInstance().getRootUrl() + run.getUrl());
            }
        } catch (ClassCastException e) {
            //LOG.info("Got ClassCast exception while converting results to Tabulated Result from action: " + testAction.getClass().getName() + ". Ignoring as we only want test results for processing.");
        }
    }

    @JavaScriptMethod
    public JSONObject getTestResults(UserConfig userConfig) {
        if (resultInfo == null) {
            return new JSONObject();
        }

        int noOfBuilds = getNoOfBuildRequired(userConfig.getNoOfBuildsNeeded());
        List<Integer> buildIds = getBuildList(noOfBuilds);

        JSONObject result = new JSONObject();
        result.put("builds", JSONArray.fromObject(buildIds));
        result.put("results", JsonTestResults.getJson(resultInfo, buildIds));

        return result;
    }

    public String getNoOfBuilds() {
        return TestResultsAnalyzerExtension.DESCRIPTOR.getNoOfBuilds();
    }

    public boolean getShowAllBuilds() {
        return TestResultsAnalyzerExtension.DESCRIPTOR.getShowAllBuilds();
    }

    public boolean getShowLineGraph() {
        return TestResultsAnalyzerExtension.DESCRIPTOR.getShowLineGraph();
    }

    public boolean getShowBarGraph() {
        return TestResultsAnalyzerExtension.DESCRIPTOR.getShowBarGraph();
    }

    public boolean getShowPieGraph() {
        return TestResultsAnalyzerExtension.DESCRIPTOR.getShowPieGraph();
    }

    public boolean getShowBuildTime() {
        return TestResultsAnalyzerExtension.DESCRIPTOR.getShowBuildTime();
    }

    public boolean getHideConfigurationMethods() {
        return TestResultsAnalyzerExtension.DESCRIPTOR.getHideConfigurationMethods();
    }

    public String getChartDataType() {
        return TestResultsAnalyzerExtension.DESCRIPTOR.getChartDataType();
    }

    public String getRunTimeLowThreshold() {
        return TestResultsAnalyzerExtension.DESCRIPTOR.getRunTimeLowThreshold();
    }

    public String getRunTimeHighThreshold() {
        return TestResultsAnalyzerExtension.DESCRIPTOR.getRunTimeHighThreshold();
    }

    public boolean isUseCustomStatusNames() {
        return TestResultsAnalyzerExtension.DESCRIPTOR.isUseCustomStatusNames();
    }

    public String getPassedRepresentation() {
        return TestResultsAnalyzerExtension.DESCRIPTOR.getPassedRepresentation();
    }

    public String getFailedRepresentation() {
        return TestResultsAnalyzerExtension.DESCRIPTOR.getFailedRepresentation();
    }

    public String getSkippedRepresentation() {
        return TestResultsAnalyzerExtension.DESCRIPTOR.getSkippedRepresentation();
    }

    public String getNaRepresentation() {
        return TestResultsAnalyzerExtension.DESCRIPTOR.getNaRepresentation();
    }

    public String getPassedColor() {
        return TestResultsAnalyzerExtension.DESCRIPTOR.getPassedColor();
    }

    public String getFailedColor() {
        return TestResultsAnalyzerExtension.DESCRIPTOR.getFailedColor();
    }

    public String getSkippedColor() {
        return TestResultsAnalyzerExtension.DESCRIPTOR.getSkippedColor();
    }

    public String getNaColor() {
        return TestResultsAnalyzerExtension.DESCRIPTOR.getNaColor();
    }
}
