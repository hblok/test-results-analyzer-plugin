package github.hblok.thor;

import hudson.Plugin;

import java.util.logging.Logger;

public class PluginImpl extends Plugin {
    public static Logger LOG = Logger.getLogger(PluginImpl.class.getName());

    public void start() throws Exception {
        LOG.info(">>>>>>>>>>>>>>>>>>>>>>>>>>> THOR - Test Results History Overview PluginImpl <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<");
    }
}
