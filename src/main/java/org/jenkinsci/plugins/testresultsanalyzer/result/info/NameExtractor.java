package org.jenkinsci.plugins.testresultsanalyzer.result.info;

import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.stream.Collectors;

import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

public class NameExtractor {

	public static JSONObject toJson(ResultInfo resultInfo) {
		JSONObject result = new JSONObject();

		for (Entry<String, Map<String, List<String>>> top : createTop(resultInfo).entrySet()) {
			JSONObject pack = new JSONObject();
			for (Entry<String, List<String>> klass : top.getValue().entrySet()) {
				pack.put(klass.getKey(), JSONArray.fromObject(klass.getValue()));
			}
			result.put(top.getKey(), pack);
		}

		return result;
	}

	public static Map<String, Map<String, List<String>>> createTop(ResultInfo ri) {
		return ri.getPackageResults().entrySet().stream().collect(Collectors.toMap(e -> {
			return e.getKey();
		}, e -> {
			return createPackage(e.getValue());
		}));
	}

	private static Map<String, List<String>> createPackage(PackageInfo pi) {
		return pi.getClasses().entrySet().stream().collect(Collectors.toMap(e -> {
			return e.getKey();
		}, e -> {
			return createClass(e);
		}));
	}

	private static List<String> createClass(Map.Entry<String, ClassInfo> e) {
		ClassInfo ci = e.getValue();
		return ci.getTests().keySet().stream().sorted().collect(Collectors.<String>toList());
	}
}
