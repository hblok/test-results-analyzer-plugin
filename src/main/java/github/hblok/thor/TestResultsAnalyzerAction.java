package github.hblok.thor;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

import org.kohsuke.stapler.bind.JavaScriptMethod;

import github.hblok.thor.config.UserConfig;
import github.hblok.thor.result.info.JsonTestResults;
import github.hblok.thor.result.info.ResultInfo;
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
import net.sf.json.JSONObject;


public class TestResultsAnalyzerAction extends Actionable implements Action {

    @SuppressWarnings("rawtypes")
    Job project;
    private Map<Integer, Long> builds = new HashMap<>();
    //private final static Logger LOG = Logger.getLogger(TestResultsAnalyzerAction.class.getName());
    private static Logger LOG = Logger.getLogger(TestResultsAnalyzerAction.class.getName());

    ResultInfo resultInfo = new ResultInfo();

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

    public boolean isUpdated() {
        Run<?, ?> lastBuild = project.getLastBuild();
        if (lastBuild == null) {
            return false;
        }

        int latestBuildNumber = lastBuild.getNumber();
        return !(builds.containsKey(latestBuildNumber));
    }

    @SuppressWarnings({"rawtypes", "unchecked"})
    public void getJsonLoadData() {
        if (!isUpdated()) {
            LOG.info("Build info is up to date");
            return;
        }

        LOG.info("Read new build info");

        RunList<Run> runs = project.getBuilds();
        for (Run run : runs) {
            if(run.isBuilding()) {
                continue;
            }

			if (builds.containsKey(run.getNumber())) {
				continue;
			}

            int buildNumber = run.getNumber();
            builds.put(buildNumber, run.getTimeInMillis());

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

	private List<Integer> getReverseSortedBuildIds(UserConfig cfg) {
		if (builds.isEmpty()) {
			return new ArrayList<>();
		}

		int requestedCount = cfg.getBuildCountRequestedInt();

		List<Integer> sortedIds = new ArrayList<>(builds.keySet());
		Collections.sort(sortedIds);
		Collections.reverse(sortedIds);
		return sortedIds.subList(0, Math.min(sortedIds.size(), requestedCount));
	}

	private JSONObject getBuildInfo(List<Integer> ids) {
		JSONObject result = new JSONObject();
		for (int id : ids) {
			result.put("" + id, builds.get(id));
		}
		return result;
	}

	@JavaScriptMethod
	public JSONObject getTestResults(UserConfig cfg) {
		if (resultInfo == null) {
			return new JSONObject();
		}

		List<Integer> ids = getReverseSortedBuildIds(cfg);

		JSONObject result = new JSONObject();
		result.put("builds", getBuildInfo(ids));
		result.put("results", JsonTestResults.getJson(resultInfo, ids));

		return result;
	}

    public String getDefaultBuildCount() {
        return TestResultsAnalyzerExtension.DESCRIPTOR.getDefaultBuildCount();
    }

}
