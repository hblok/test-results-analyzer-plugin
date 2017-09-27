package github.hblok.thor.result.data;

public enum ResultStatus {
	PASSED("P"), FAILED("F"), SKIPPED("S"), NA("/");

	public final String shortForm;

	private ResultStatus(String shortForm) {
		this.shortForm = shortForm;
	}
}
