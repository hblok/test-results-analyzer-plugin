package org.jenkinsci.plugins.testresultsanalyzer.result.info;

import java.util.ArrayList;
import java.util.List;
import java.util.Map.Entry;

import org.jenkinsci.plugins.testresultsanalyzer.result.data.ResultData;
import org.jenkinsci.plugins.testresultsanalyzer.result.data.ResultStatus;

import net.sf.json.JSONObject;

public class JsonTestResults {

	private static final String TEST_RESULTS = "testResults";
	private static final String CHILDREN = "children";

	public static JSONObject getJson(ResultInfo resultInfo, List<Integer> buildIds) {
		JSONObject packages = new JSONObject();

		for (Entry<String, PackageInfo> pi : resultInfo.getPackageResults().entrySet()) {

			JSONObject classes = new JSONObject();

			for (Entry<String, ClassInfo> ci : pi.getValue().getChildren().entrySet()) {

				JSONObject tests = new JSONObject();

				for (Entry<String, TestCaseInfo> ti : ci.getValue().getTests().entrySet()) {
					JSONObject results = getResultsJSON(ti.getValue(), buildIds);
					if (results != null) {
						tests.put(ti.getKey(), results);
					}
				}

				if (!tests.isEmpty()) {
					JSONObject klass = new JSONObject();
					klass.put(TEST_RESULTS, getResultsString(ci.getValue(), buildIds));
					klass.put(CHILDREN, tests);
					classes.put(ci.getKey(), klass);
				}
			}

			if (!classes.isEmpty()) {
				JSONObject pack = new JSONObject();
				pack.put(TEST_RESULTS, getResultsString(pi.getValue(), buildIds));
				pack.put(CHILDREN, classes);
				packages.put(pi.getKey(), pack);
			}
		}

		JSONObject results = new JSONObject();
		results.put(CHILDREN, packages);
		return results;
	}

	private static String getResultsString(Info info, List<Integer> buildIds) {
		List<String> results = new ArrayList<>();

		for (int id : buildIds) {
			ResultData buildResult = info.getBuildResult(id);
			ResultStatus status = buildResult != null ? buildResult.getStatus() : ResultStatus.NA;
			results.add(status.shortForm);
		}

		String resultStr = String.join("", results);

		if (resultStr.replaceAll(ResultStatus.NA.shortForm, "").isEmpty()) {
			return null;
		}

		return resultStr;
	}

	private static JSONObject getResultsJSON(Info info, List<Integer> buildIds) {
		String resultsString = getResultsString(info, buildIds);
		if (resultsString == null) {
			return null;
		}

		JSONObject testResults = new JSONObject();
		testResults.put(TEST_RESULTS, resultsString);
		return testResults;
	}
}
