package github.hblok.thor.config;

import org.kohsuke.stapler.DataBoundConstructor;

public class UserConfig {

	private String buildCountRequested;

	@DataBoundConstructor
	public UserConfig(String buildCountRequested) {
		this.buildCountRequested = buildCountRequested;
	}

	public String getBuildCountRequested() {
		return buildCountRequested;
	}

	public int getBuildCountRequestedInt() {
		try {
			return Integer.parseInt(buildCountRequested);
		} catch (NumberFormatException e) {
			return 1;
		}
	}

	public void setBuildCountRequested(String buildCountRequested) {
		this.buildCountRequested = buildCountRequested;
	}
}
