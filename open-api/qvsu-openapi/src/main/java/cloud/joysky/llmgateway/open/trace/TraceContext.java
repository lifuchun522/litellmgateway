package cloud.joysky.llmgateway.open.trace;

/**
 * OpenAPI 调用链 traceId 上下文
 */
public final class TraceContext
{
    private static final ThreadLocal<String> TRACE_ID_HOLDER = new ThreadLocal<String>();

    private TraceContext()
    {
    }

    public static void set(String traceId)
    {
        TRACE_ID_HOLDER.set(traceId);
    }

    public static String get()
    {
        return TRACE_ID_HOLDER.get();
    }

    public static void clear()
    {
        TRACE_ID_HOLDER.remove();
    }
}
