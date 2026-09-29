package com.qvsu.open.web;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import javax.servlet.ReadListener;
import javax.servlet.ServletInputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletRequestWrapper;
import org.springframework.util.StreamUtils;

/**
 * 支持多次读取 body 的 request 包装
 */
public class CachedBodyHttpServletRequest extends HttpServletRequestWrapper
{
    private final byte[] cachedBody;

    public CachedBodyHttpServletRequest(HttpServletRequest request) throws IOException
    {
        super(request);
        InputStream requestInputStream = request.getInputStream();
        this.cachedBody = StreamUtils.copyToByteArray(requestInputStream);
    }

    @Override
    public ServletInputStream getInputStream()
    {
        final ByteArrayInputStream byteArrayInputStream = new ByteArrayInputStream(this.cachedBody);
        return new ServletInputStream()
        {
            @Override
            public boolean isFinished()
            {
                return byteArrayInputStream.available() == 0;
            }

            @Override
            public boolean isReady()
            {
                return true;
            }

            @Override
            public void setReadListener(ReadListener readListener)
            {
            }

            @Override
            public int read()
            {
                return byteArrayInputStream.read();
            }
        };
    }

    @Override
    public BufferedReader getReader()
    {
        return new BufferedReader(new InputStreamReader(getInputStream(), StandardCharsets.UTF_8));
    }

    public String getBodyAsString()
    {
        return new String(this.cachedBody, StandardCharsets.UTF_8);
    }

    public byte[] getBodyBytes()
    {
        return this.cachedBody;
    }
}
