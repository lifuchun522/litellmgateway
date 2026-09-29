package com.qvsu.open.controller;

import com.qvsu.common.core.controller.BaseController;
import com.qvsu.common.core.domain.AjaxResult;
import com.qvsu.common.core.text.Convert;
import com.qvsu.open.doc.ApiDocService;
import com.qvsu.open.domain.OpenApiDoc;
import com.qvsu.open.service.OpenManageService;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;


@Controller
@RequestMapping("/admin/open/doc")
public class OpenDocController extends BaseController
{
    private final OpenManageService openManageService;

    private final ApiDocService apiDocService;

    public OpenDocController(OpenManageService openManageService, ApiDocService apiDocService)
    {
        this.openManageService = openManageService;
        this.apiDocService = apiDocService;
    }

    @GetMapping()
    public String page()
    {
        return "open/doc/index";
    }

    @GetMapping("/apis")
    @ResponseBody
    public AjaxResult apis()
    {
        return AjaxResult.success(openManageService.selectApiList(null));
    }

    @GetMapping(value = "/html/{apiId}", produces = MediaType.TEXT_HTML_VALUE)
    @ResponseBody
    public String html(@PathVariable("apiId") Long apiId, HttpServletRequest request)
    {
        return apiDocService.generateApiHtml(apiId, resolveBaseUrl(request));
    }


    @GetMapping("/list")
    @ResponseBody
    public AjaxResult list()
    {
        return AjaxResult.success(openManageService.selectDocList());
    }

    @PostMapping("/generate")
    @ResponseBody
    public AjaxResult generate(Long appId, String apiIds, String docTitle, String docVersion, HttpServletRequest request)
    {
        List<Long> ids = Arrays.stream(Convert.toLongArray(apiIds)).collect(Collectors.toList());
        String html = apiDocService.generateHtml(appId, ids, resolveBaseUrl(request));

        OpenApiDoc doc = new OpenApiDoc();

        doc.setAppId(appId);
        doc.setDocTitle(docTitle);
        doc.setDocVersion(docVersion);
        doc.setApiIds(apiIds);
        doc.setHtmlContent(html);
        openManageService.saveDoc(doc);

        return AjaxResult.success(html);
    }

    @GetMapping("/download")
    public void download(Long appId, String apiIds, HttpServletRequest request, HttpServletResponse response)
    {
        try
        {
            List<Long> ids = Arrays.stream(Convert.toLongArray(apiIds)).collect(Collectors.toList());
            String html = apiDocService.generateHtml(appId, ids, resolveBaseUrl(request));
            String fileName = "api-doc-" + LocalDate.now() + ".html";

            response.setContentType(MediaType.TEXT_HTML_VALUE);
            response.setCharacterEncoding(StandardCharsets.UTF_8.name());
            response.setHeader("Content-Disposition", "attachment; filename=\"" + fileName + "\"");
            response.getWriter().write(html);
            response.getWriter().flush();
        }
        catch (Exception ignored)
        {
        }
    }

    private String resolveBaseUrl(HttpServletRequest request)
    {
        String scheme = Optional.ofNullable(request.getHeader("X-Forwarded-Proto")).orElse(request.getScheme());
        String host = Optional.ofNullable(request.getHeader("X-Forwarded-Host")).orElse(request.getServerName());
        String port = Optional.ofNullable(request.getHeader("X-Forwarded-Port"))
                .filter(value -> !host.contains(":"))
                .map(value -> ":" + value)
                .orElseGet(() -> isDefaultPort(request) ? "" : ":" + request.getServerPort());
        return scheme + "://" + host + port + Optional.ofNullable(request.getContextPath()).orElse("");
    }

    private boolean isDefaultPort(HttpServletRequest request)
    {
        return ("http".equalsIgnoreCase(request.getScheme()) && request.getServerPort() == 80)
                || ("https".equalsIgnoreCase(request.getScheme()) && request.getServerPort() == 443);
    }
}

