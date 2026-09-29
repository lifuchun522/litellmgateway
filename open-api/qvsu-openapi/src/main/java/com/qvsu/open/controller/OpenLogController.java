package com.qvsu.open.controller;

import com.qvsu.common.core.controller.BaseController;
import com.qvsu.common.core.domain.AjaxResult;
import com.qvsu.common.core.page.TableDataInfo;
import com.qvsu.open.domain.OpenCallLog;
import com.qvsu.open.service.OpenManageService;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
@RequestMapping("/admin/open/log")
public class OpenLogController extends BaseController
{
    private static final Logger log = LoggerFactory.getLogger(OpenLogController.class);

    private final OpenManageService openManageService;

    public OpenLogController(OpenManageService openManageService)
    {
        this.openManageService = openManageService;
    }

    @GetMapping()
    public String logPage()
    {
        return "open/log/index";
    }

    @PostMapping("/list")
    @ResponseBody
    public TableDataInfo list(OpenCallLog query)
    {
        startPage();
        List<OpenCallLog> list = openManageService.selectLogList(query);
        return getDataTable(list);
    }

    @GetMapping("/stats")
    @ResponseBody
    public AjaxResult stats()
    {
        return AjaxResult.success(openManageService.queryLogStatsToday());
    }

    @GetMapping("/exportCsv")
    public void exportCsv(@RequestParam(required = false) String traceId,
                          @RequestParam(required = false) String appKey,
                          @RequestParam(required = false) String apiPath,
                          @RequestParam(required = false) Integer status,
                          @RequestParam(required = false) String beginTime,
                          @RequestParam(required = false) String endTime,
                          HttpServletResponse response)
    {
        log.info("[OpenAPI] 导出日志CSV: traceId={}, appKey={}, beginTime={}, endTime={}", traceId, appKey, beginTime, endTime);
        try
        {
            // 构建查询对象
            OpenCallLog query = new OpenCallLog();
            query.setTraceId(traceId);
            query.setAppKey(appKey);
            query.setApiPath(apiPath);
            query.setStatus(status);
            Map<String, Object> params = new HashMap<>();
            params.put("beginTime", beginTime);
            params.put("endTime", endTime);
            query.setParams(params);

            List<OpenCallLog> list = openManageService.selectLogList(query);
            String fileName = "open-log-" + LocalDate.now() + ".csv";
            response.setCharacterEncoding(StandardCharsets.UTF_8.name());
            response.setContentType("text/csv;charset=UTF-8");
            response.setHeader("Content-Disposition", "attachment; filename=\"" + fileName + "\"");

            StringBuilder sb = new StringBuilder();
            sb.append('\uFEFF');
            sb.append("traceId,appKey,appName,apiPath,method,respCode,costMs,status,errorMsg,clientIp,callTime,reqBody,respBody\n");

            for (OpenCallLog item : list)
            {
                sb.append(csv(item.getTraceId())).append(',')
                        .append(csv(item.getAppKey())).append(',')
                        .append(csv(item.getAppName())).append(',')
                        .append(csv(item.getApiPath())).append(',')
                        .append(csv(item.getMethod())).append(',')
                        .append(csv(item.getRespCode())).append(',')
                        .append(csv(item.getCostMs())).append(',')
                        .append(csv(item.getStatus())).append(',')
                        .append(csv(item.getErrorMsg())).append(',')
                        .append(csv(item.getClientIp())).append(',')
                        .append(csv(item.getCallTime())).append(',')
                        .append(csv(item.getReqBody())).append(',')
                        .append(csv(item.getRespBody())).append('\n');

            }
            response.getWriter().write(sb.toString());
            response.getWriter().flush();
            log.info("[OpenAPI] 导出日志CSV完成: 记录数={}", list.size());
        }
        catch (Exception ex)
        {
            log.error("[OpenAPI] 导出日志CSV失败", ex);
        }
    }

    private String csv(Object value)
    {
        if (value == null)
        {
            return "\"\"";
        }
        String text = String.valueOf(value).replace("\"", "\"\"").replace("\r", " ").replace("\n", " ");
        return "\"" + text + "\"";
    }
}
