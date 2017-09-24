package org.jenkinsci.plugins.testresultsanalyzer.result.info;

import java.util.ArrayList;
import java.util.List;
import java.util.Map.Entry;

import org.jenkinsci.plugins.testresultsanalyzer.result.data.ResultData;
import org.jenkinsci.plugins.testresultsanalyzer.result.data.ResultStatus;

import net.sf.json.JSONObject;

public class JsonTestResults {

	public static JSONObject getJson(ResultInfo resultInfo, List<Integer> buildIds) {
		JSONObject result = new JSONObject();

		for (Entry<String, PackageInfo> pi : resultInfo.getPackageResults().entrySet()) {

			JSONObject pack = new JSONObject();

			for (Entry<String, ClassInfo> ci : pi.getValue().getChildren().entrySet()) {

				JSONObject klass = new JSONObject();

				for (Entry<String, TestCaseInfo> ti : ci.getValue().getTests().entrySet()) {
					String results = getResults(ti.getValue(), buildIds);
					if (results != null) {
						klass.put(ti.getKey(), results);
					}
				}

				if (!klass.isEmpty()) {
					pack.put(ci.getKey(), klass);
				}
			}

			if (!pack.isEmpty()) {
				result.put(pi.getKey(), pack);
			}
		}

		return result;
	}

	private static String getResults(TestCaseInfo ti, List<Integer> buildIds) {
		List<String> results = new ArrayList<>();

		for (int id : buildIds) {
			ResultData buildResult = ti.getBuildResult(id);
			ResultStatus status = buildResult != null ? buildResult.getStatus() : ResultStatus.NA;
			results.add(status.shortForm);
		}

		String resultStr = String.join("", results);

		if (resultStr.replaceAll(ResultStatus.NA.shortForm, "").isEmpty()) {
			return null;
		}

		return resultStr;
	}
}
