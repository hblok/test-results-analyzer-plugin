package github.hblok.thor.result.data;

import hudson.tasks.test.TestResult;

public class PackageResultData extends ResultData {

	public PackageResultData(TestResult packageResult, String url) {
        super(packageResult, url);
	}
}
