package github.hblok.thor.result.info;

import hudson.tasks.test.TestResult;

import java.util.Map;

import github.hblok.thor.result.data.TestCaseResultData;

public class TestCaseInfo extends Info {

	public void putTestCaseResult(Integer buildNumber, TestResult testCaseResult, String url) {
		TestCaseResultData testCaseResultData = new TestCaseResultData(testCaseResult, url);
		setConfig(testCaseResultData.isConfig());
		this.buildResults.put(buildNumber, testCaseResultData);
	}

	@Override
	public Map<String, ? extends Info> getChildren() {
		return null;
	}
}
