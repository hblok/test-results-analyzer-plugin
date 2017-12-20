package github.hblok.thor;

import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.logging.Logger;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import javax.annotation.Nonnull;

import hudson.Extension;
import hudson.model.Action;
import hudson.model.Describable;
import hudson.model.Descriptor;
import hudson.model.Job;
import hudson.util.FormValidation;
import jenkins.model.TransientActionFactory;
import net.sf.json.JSONObject;
import org.kohsuke.stapler.QueryParameter;
import org.kohsuke.stapler.StaplerRequest;

@Extension
public class TestResultsAnalyzerExtension extends TransientActionFactory<Job> implements Describable<TestResultsAnalyzerExtension> {

	private static Logger LOG = Logger.getLogger(TestResultsAnalyzerExtension.class.getName());

	private Map<Job, Action> jobActions = new HashMap<>();

	@Override
	public @Nonnull Collection<? extends Action> createFor(@Nonnull Job target) {
		if (!jobActions.containsKey(target)) {
			jobActions.put(target, new TestResultsAnalyzerAction(target));
		}
		return Collections.singleton(jobActions.get(target));
	}

    @Override
    public Class<Job> type() {
        return Job.class;
    }

    //based on DiskUsageProjectActionFactory
    @Extension
    public static final DescriptorImpl DESCRIPTOR = new DescriptorImpl();

    public Descriptor<TestResultsAnalyzerExtension> getDescriptor() {
        return DESCRIPTOR;
    }

    public static class DescriptorImpl extends Descriptor<TestResultsAnalyzerExtension> {

        private String defaultBuildCount = "10";

        public DescriptorImpl() {
            load();
        }

        @Override
        public String getDisplayName() {
            return "THOR - Test Results History Overview";
        }

        @Override
        public boolean configure(StaplerRequest req, JSONObject formData) {
            try {
            	defaultBuildCount = formData.getString("defaultBuildCount");
            } catch(Exception e) {
                e.printStackTrace();
            }
            save();
            return true;
        }

        public String getDefaultBuildCount() { return defaultBuildCount; }
    }
}
